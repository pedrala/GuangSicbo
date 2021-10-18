import io from 'socket.io-client'
import { API_SERVER } from './endpoint.js';

/**
 * Websocket server
 */
const WEBSOCKET_URL = API_SERVER;

/**
 * option for public channel
 */
const OPT_PUBLIC = {
  query: {
    channel: 'public'
  }
}

export default class WebSocket {
  /**
   * constractor
   */
  constructor() {
    this.publicChannel = false;
  }

  /**
   * public 채널을 연결한다.
   */
  connectToPublicChannel() {
    this.publicChannel = io(WEBSOCKET_URL, OPT_PUBLIC);
  }

  /**
   * 
   * @param {string} accountName 
   */
  connectprivateChannel(accountName) {
    this.privateChannel = io(WEBSOCKET_URL, {
      query: {
        channel: 'private',
        name: accountName
      }
    });
  }
}