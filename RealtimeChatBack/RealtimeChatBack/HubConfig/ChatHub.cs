using Microsoft.AspNetCore.SignalR;
using RealtimeChatBack.EFModels;
using RealtimeChatBack.HubModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RealtimeChatBack.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IDictionary<string, UserRoomConnection> _connection;
        private readonly SignalrContext _context;

        public ChatHub(IDictionary<string, UserRoomConnection> connection, SignalrContext context)
        {
            _connection = connection;
            _context = context;
        }

        public async Task JoinRoom(UserRoomConnection userConnection)
        {
            var user = _context.Person.SingleOrDefault(u => u.Username == userConnection.User);

            if (user == null)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "Error", "User not found.");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, userConnection.Room);
            _connection[Context.ConnectionId] = userConnection;
            await Clients.Group(userConnection.Room)
                .SendAsync("ReceiveMessage", "Lets Program Bot", $"{userConnection.User} has Joined the Group", DateTime.Now);
            await SendConnectedUser(userConnection.Room);
        }

        public async Task SendMessage(string message)
        {
            if (_connection.TryGetValue(Context.ConnectionId, out UserRoomConnection userRoomConnection))
            {
                await Clients.Group(userRoomConnection.Room)
                    .SendAsync("ReceiveMessage", userRoomConnection.User, message, DateTime.Now);
            }
        }

        public override Task OnDisconnectedAsync(Exception? exp)
        {
            if (!_connection.TryGetValue(Context.ConnectionId, out UserRoomConnection roomConnection))
            {
                return base.OnDisconnectedAsync(exp);
            }

            _connection.Remove(Context.ConnectionId);
            Clients.Group(roomConnection.Room)
                .SendAsync("ReceiveMessage", "Lets Program bot", $"{roomConnection.User} has Left the Group", DateTime.Now);
            SendConnectedUser(roomConnection.Room);
            return base.OnDisconnectedAsync(exp);
        }

        public Task SendConnectedUser(string room)
        {
            var users = _connection.Values
                .Where(u => u.Room == room)
                .Select(s => s.User);
            return Clients.Group(room).SendAsync("ConnectedUser", users);
        }
    }
}
