// Private pilot scheduler only. No public API and no chat provider calls.
import {runNotificationTick} from './notifications.mjs';
export default {scheduled(controller,env,ctx){ctx.waitUntil(runNotificationTick(env))},fetch(){return new Response('Not found',{status:404})}};
