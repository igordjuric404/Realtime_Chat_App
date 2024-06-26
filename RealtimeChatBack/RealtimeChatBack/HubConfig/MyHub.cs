﻿// SignalR Hub za upravljanje funkcionalnostima realnog vremena u chatu
using Microsoft.AspNetCore.SignalR;
using RealtimeChatBack.EFModels;
using RealtimeChatBack.HubModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RealtimeChatBack.HubConfig
{
    public partial class MyHub : Hub
    {
        private readonly SignalrContext ctx;

        public MyHub(SignalrContext context)
        {
            ctx = context;
        }

        // Metoda koja se poziva kada korisnik prekine konekciju sa hubom
        public override Task OnDisconnectedAsync(Exception exception)
        {
            Guid currUserId = ctx.Connections.Where(c => c.SignalrId == Context.ConnectionId).Select(c => c.PersonId).SingleOrDefault();
            ctx.Connections.RemoveRange(ctx.Connections.Where(p => p.PersonId == currUserId).ToList());
            ctx.SaveChanges();
            Clients.Others.SendAsync("userOff", currUserId);
            return base.OnDisconnectedAsync(exception);
        }

        // Metoda za registraciju novog korisnika
        public async Task RegisterUser(PersonInfo personInfo)
        {
            if (ctx.Person.Any(p => p.Username == personInfo.Username))
            {
                await Clients.Caller.SendAsync("registerResponseFail", "Korisničko ime već postoji.");
                return;
            }

            var newPerson = new Person
            {
                Id = Guid.NewGuid(),
                Username = personInfo.Username,
                Password = personInfo.Password // U pravoj aplikaciji, obavezno hashujte šifru
            };

            await ctx.Person.AddAsync(newPerson);
            await ctx.SaveChangesAsync();

            await Clients.Caller.SendAsync("registerResponseSuccess", newPerson);
        }

        // Metoda za autentifikaciju korisnika
        public async Task AuthenticateUser(PersonInfo personInfo)
        {
            string currSignalrID = Context.ConnectionId;
            Person tempPerson = ctx.Person.Where(p => p.Username == personInfo.Username && p.Password == personInfo.Password).SingleOrDefault();

            if (tempPerson != null)
            {
                Connections currUser = new Connections
                {
                    PersonId = tempPerson.Id,
                    SignalrId = currSignalrID,
                    TimeStamp = DateTime.Now
                };
                await ctx.Connections.AddAsync(currUser);
                await ctx.SaveChangesAsync();

                User newUser = new User(tempPerson.Id, tempPerson.Username, currSignalrID);
                await Clients.Caller.SendAsync("authMeResponseSuccess", newUser);
                await Clients.Others.SendAsync("userOn", newUser);
            }
            else
            {
                await Clients.Caller.SendAsync("authMeResponseFail");
            }
        }

        // Metoda za ponovnu autentifikaciju korisnika
        public async Task ReauthenticateUser(Guid personId)
        {
            string currSignalrID = Context.ConnectionId;
            Person tempPerson = ctx.Person.Where(p => p.Id == personId).SingleOrDefault();

            if (tempPerson != null)
            {
                Connections currUser = new Connections
                {
                    PersonId = tempPerson.Id,
                    SignalrId = currSignalrID,
                    TimeStamp = DateTime.Now
                };
                await ctx.Connections.AddAsync(currUser);
                await ctx.SaveChangesAsync();

                User newUser = new User(tempPerson.Id, tempPerson.Username, currSignalrID);
                await Clients.Caller.SendAsync("reauthMeResponse", newUser);
                await Clients.Others.SendAsync("userOn", newUser);
            }
        }

        // Metoda za odjavljivanje korisnika
        public void LogoutUser(Guid personId)
        {
            ctx.Connections.RemoveRange(ctx.Connections.Where(p => p.PersonId == personId).ToList());
            ctx.SaveChanges();
            Clients.Caller.SendAsync("logoutResponse");
            Clients.Others.SendAsync("userOff", personId);
        }

        // Metoda za dobijanje online korisnika
        public async Task FetchOnlineUsers()
        {
            Guid currUserId = ctx.Connections.Where(c => c.SignalrId == Context.ConnectionId).Select(c => c.PersonId).SingleOrDefault();
            List<User> onlineUsers = ctx.Connections
                .Where(c => c.PersonId != currUserId)
                .Select(c => new User(c.PersonId, ctx.Person.Where(p => p.Id == c.PersonId).Select(p => p.Username).SingleOrDefault(), c.SignalrId))
                .ToList();

            await Clients.Caller.SendAsync("getOnlineUsersResponse", onlineUsers);
        }

        // Metoda za slanje poruke drugom korisniku
        public async Task SendMessageToUser(string connId, string msg)
        {
            await Clients.Client(connId).SendAsync("sendMsgResponse", Context.ConnectionId, msg);
        }
    }
}
