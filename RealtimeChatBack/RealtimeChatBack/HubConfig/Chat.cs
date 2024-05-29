// Konfiguracija SignalR huba
using Microsoft.AspNetCore.SignalR;
using RealtimeChatBack.HubModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RealtimeChatBack.HubConfig
{
    public partial class MyHub
    {
        // Metoda za dobijanje spiska online korisnika
        public async Task getOnlineUsers()
        {
            Guid currUserId = ctx.Connections.Where(c => c.SignalrId == Context.ConnectionId).Select(c => c.PersonId).SingleOrDefault();
            List<User> onlineUsers = ctx.Connections
                .Where(c => c.PersonId != currUserId)
                .Select(c => new User(c.PersonId, ctx.Person.Where(p => p.Id == c.PersonId).Select(p => p.Username).SingleOrDefault(), c.SignalrId))
                .ToList();

            foreach (var user in onlineUsers)
            {
                Console.WriteLine($"Id: {user.Id}, Username: {user.Username}, ConnId: {user.ConnId} \n");
            }

            await Clients.Caller.SendAsync("getOnlineUsersResponse", onlineUsers);
        }

        // Metoda za slanje poruke drugom korisniku
        public async Task sendMsg(string connId, string msg)
        {
            await Clients.Client(connId).SendAsync("sendMsgResponse", Context.ConnectionId, msg);
        }
    }
}
