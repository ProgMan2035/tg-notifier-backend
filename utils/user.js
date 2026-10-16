import db from '../db.js';

export function getSender(idInstance, apiTokenInstance) {
  return db.users.find((usr) => 
    (
      usr.idInstance === idInstance &&
      usr.apiTokenInstance === apiTokenInstance
    )
  );
}

export function getReceiver(chatId, idInstance, apiTokenInstance) {
  return db.users.find((usr) => 
    (
      usr.idInstance !== idInstance &&
      usr.apiTokenInstance !== apiTokenInstance &&
      usr.phoneNumber === chatId
    )
  );
}
