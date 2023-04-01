const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // npm i input

const apiId = 1234;
const apiHash = "";
const stringSession = new StringSession(""); // fill this later with the value from session.save()

var fs = require('fs');

const removeEmojis = (text) => {
    if (!text) {
      return '';
    }
    return text.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g, '');
}

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start();
  console.log("You should now be connected.");
  
  
  const chatIds = [-12345]; // Chat ids as array
  
  
  chatIds.forEach(async (chatId) => {
    
    const members = await client.getParticipants(chatId);
    
    const bots = members.filter(member => member.bot == true);
    var botChatIds = [];
    
    bots.forEach((item)=>{
        botChatIds.push(item['id']['value']);
    })  
    
    var i = 0;
        
    while(true) {
        try {
    
            if(i >= 250) { // 250*200 = 50k message each chat
                break;
            }
            
            var offset = i;
            if (i != 0)
            {
                offset = i+200
            } 
            
            const history = await client.getMessages(chatId, {
                limit: 200,
                offsetId: 0,
                offsetDate: 0,
                addOffset: offset,
                maxId: 0,
                minId: 0,
                hash: 0
            });
    
            var messages = []
            
            history.forEach((item)=>{
                messages.push([item['message'],item['fromId']['userId']['value']]);
            })     
            
            messages.forEach((item) => {
                var text = item[0];
                var userId = item[1];
                console.log(botChatIds);
                console.log(userId);
                if (typeof text === 'string' && botChatIds.indexOf(userId) == -1) {
                    
                    text = text.replace(/\r?\n|\r/g, ' ');
                    text = removeEmojis(text);
                    
                    if (text != '') {
                        fs.appendFile(`./chats/${chatId}.txt`, `${text}\n`, function (err) {
                            if (err) throw err;
                        });
                    }
                    
                }
                
            })
            
            i++;
            setTimeout(() => {}, 500); // bot should take 125sec each chat
            
        } catch (error) {
            break;
        }
    }
  })
  
})();
