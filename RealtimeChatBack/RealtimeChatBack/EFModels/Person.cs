using System;
using System.Collections.Generic;

#nullable disable

namespace RealtimeChatBack.EFModels
{
    public partial class Person
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }

}
