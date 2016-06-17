package com.witwolf.main;

import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Button;

import com.horizon.android.R;
import com.witwolf.signal.WebSocketSignaling;

public class MainActivity extends AppCompatActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);


    Button connectBtn = (Button)findViewById(R.id.connect);
    connectBtn.setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View v) {
        WebSocketSignaling signaling = new WebSocketSignaling(null);
        signaling.start();
      }
    });

  }


}
