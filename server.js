import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import db from './db.js';
import { intervalRequest } from '#utils/interval.js';
import { getSender, getReceiver } from '#utils/user.js';
import { logInfo, logError } from '#utils/logger.js';

const internalServerError = {
  statusCode: 500,
  message: 'Internal Server Error',
};

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

//////////////////////////////////////////////////////////////////////

// * Отправка [✅]
app.post('/:idInstance/sendMessage/:apiTokenInstance', (req, res) => {
  try {
    const { idInstance, apiTokenInstance } = req.params;
    const { chatId, message } = req.body || {};

    const path = req.originalUrl;
    const timestamp = (new Date()).toISOString();

    logInfo({
      request: path,
      method: 'POST',
      timestamp,
      data: req.body || {},
    });

    const sender = getSender(idInstance, apiTokenInstance);

    if (!sender) {
      logError({
        statusCode: 400,
        request: path,
        timestamp,
        message: 'Validation faild',
        data: user,
      });

      res.status(400).json({ 
        statusCode: 400,
        timestamp,
        path,
        message: 'Validation faild',
      });
    }

    if (!chatId) {
      res.status(400).json({
        statusCode: 400,
        timestamp,
        path,
        message: 'Validation failed. Details: \'chatId\' is not allowed to be empty',
      });
    }

    if (!sender.phoneNumber === chatId) {
      res.status(400).json({
        statusCode: 400,
        timestamp,
        path,
        message: 'Validationa failed.',
      });
    }

    if (!message) {
      res.status(400).json({
        statusCode: 400,
        timestamp,
        path,
        message: 'Validation failed. Details: \'message\' is not allowed to be empty',
      });
    }

    const receiver = getReceiver(chatId, idInstance, apiTokenInstance);
    const lastNotify = receiver.notifications.at(-1);

    receiver.notifications.push({
      receiptId: lastNotify ? lastNotify.receiptId + 1 : 1,
      body: {
        senderData: {
          chatId,
          sender: chatId,
          senderName: sender.name,
        },
        messageData: {
          typeMessage: 'textMessage',
          textMessageData: {
            textMessage: message,
          },
        },
      },
    });

    res.status(200).json({
      'idMessage': crypto.randomUUID(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(internalServerError);
  }
});

// * Получить уведомление (сообщение) [✅]
app.get('/:idInstance/receiveNotification/:apiTokenInstance', async (req, res) => {
  try {
    const { idInstance, apiTokenInstance } = req.params;
    const { receiveTimeout } = req.query;

    logInfo({
      request: `/${idInstance}/receiveNotification/${apiTokenInstance}`,
      method: 'GET',
      timestamp: (new Date()).toISOString(),
      query: req.query || {},
      data: req.body || {},
    });

    const sender = getSender(idInstance, apiTokenInstance);

    if (!sender) {
      logError({
        statusCode: 400,
        request: path,
        timestamp,
        message: 'Validation faild',
        data: user,
      });

      res.status(400).json({ 
        statusCode: 400,
        timestamp,
        path,
        message: 'Validation faild',
      });
    }

    if (!receiveTimeout) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid query parameter: receiveTimeout',
      });
    }

    const item = await intervalRequest(receiveTimeout,
      () => sender.notifications.length,
      () => sender.notifications[0],
    );

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json(internalServerError);
  }
});

// * Обработать уведомление (сообщение) [✅]
app.delete('/:idInstance/deleteNotification/:apiTokenInstance/:receiptId', (req, res) => {
  try {
    const { idInstance, apiTokenInstance, receiptId } = req.params;
    const path = req.originalUrl;

    logInfo({
      request: `/${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`,
      method: 'DELETE',
      timestamp: (new Date()).toISOString(),
      params: req.params || {},
      query: req.query || {},
      data: req.body || {},
    });

    const sender = getSender(idInstance, apiTokenInstance);

    if (!sender) {
      logError({
        statusCode: 400,
        request: path,
        timestamp,
        message: 'Validation faild',
        data: user,
      });

      res.status(400).json({ 
        statusCode: 400,
        timestamp,
        path,
        message: 'Validation faild',
      });
    }

    if (!receiptId) {
      res.status(400).json({
        result: false,
        reason: 'Parameter receiptId must be a Number!',
      });
    }

    sender.notifications = sender.notifications.filter((notify) => (
      notify.receiptId !== +receiptId
    ));
    
    res.status(200).json({
      result: true,
    });
  } catch(err) {
    console.error(err);
    res.status(500).json(internalServerError);
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
