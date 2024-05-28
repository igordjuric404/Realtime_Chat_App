using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RealtimeChatBack.HubModels
{
    public class PersonInfo
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } 
        public string ConnId { get; set; }

        public User(Guid id, string username, string connId)
        {
            Id = id;
            Username = username;
            ConnId = connId;
        }
    }

}
