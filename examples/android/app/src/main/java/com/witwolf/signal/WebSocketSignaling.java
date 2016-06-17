package com.witwolf.signal;


import android.util.Log;


import org.json.JSONObject;

import java.net.MalformedURLException;

import io.socket.IOAcknowledge;
import io.socket.IOCallback;
import io.socket.SocketIO;
import io.socket.SocketIOException;

/**
 * Created by witwolf on 3/21/16.
 */
public class WebSocketSignaling extends Thread {

  public static String serverUrl = "http://10.9.5.40:9999";


  private SignalingListener listener = null;
  private boolean isConnected = false;

  private SocketIO socket = null;

  private final static String TAG = WebSocketSignaling.class.getSimpleName();


  public WebSocketSignaling(SignalingListener listener) {
    super();
    this.listener = listener;
  }

  @Override
  public void run() {
    try {
      socket = new SocketIO(serverUrl, new IOCallback() {
        @Override
        public void onDisconnect() {
          Log.d(TAG, "Socket disconnected ");
        }

        @Override
        public void onConnect() {
          Log.d(TAG, "Socket connected");
        }

        @Override
        public void onMessage(String s, IOAcknowledge ioAcknowledge) {

        }

        @Override
        public void onMessage(JSONObject jsonObject, IOAcknowledge ioAcknowledge) {

        }

        @Override
        public void on(String s, IOAcknowledge ioAcknowledge, Object... objects) {

        }

        @Override
        public void onError(SocketIOException e) {
          e.printStackTrace();
          Log.e(TAG, "Error:" + e.toString());
        }
      });
    } catch (MalformedURLException e) {
      Log.e(TAG, "Socket connect failed : " + e.getMessage());
      e.printStackTrace();
    }
  }
}
