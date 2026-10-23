/* Where personal Orivia lives on this deployment: '/' on the private pilot, '/app' on myorivia.app
 * (where the website owns '/'). Only these two values are accepted; anything else means '/'. */
export const appHome=env=>env?.APP_HOME==='/app'?'/app':'/';
