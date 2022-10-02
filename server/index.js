const express = require('express');
const cors = require('cors');
const uuid = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

let subscribers = {};

function events(request, response, next) {
  const teamId = request.query.team_id;

  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  });
  
  const subscriberId = uuid.v4();  
  response.write(`data: ${JSON.stringify({id: subscriberId})}\n\n`);

  const subscriber = {
    id: subscriberId,
    userId: request.query.user_id,
    response
  };

  if (!subscribers.hasOwnProperty(teamId)) {
    subscribers[teamId] = [];
  } 

  subscribers[teamId].push(subscriber);

  request.on('close', () => {
    console.log(`${subscriberId} Connection closed`);
    subscribers[teamId] = subscribers[teamId].filter(sub => sub.id !== subscriberId);
  });
}
  
async function sendEvent(request, response, next) {
  const event = request.body;
  subscribers[event.team_id].forEach(subscriber => subscriber.response.write(`data: ${JSON.stringify(event)}\n\n`));
  response.json({success: true});
}

app.get('/events', events);
app.post('/send-event', sendEvent);

app.listen(3000, () => {
  console.log('Events service started at http://localhost:3000')
});
