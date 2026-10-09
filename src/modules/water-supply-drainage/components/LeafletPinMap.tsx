import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

const DEFAULT_CENTER = { latitude: 14.71, longitude: 121.015 };

const createLeafletHtml = (readOnly: boolean) => `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#map{height:100%;width:100%;margin:0;padding:0;background:#e8eeeb}.leaflet-container{font-family:Arial,sans-serif}.pin{background:#16764a;border:3px solid #fff;border-radius:50%;box-shadow:0 1px 6px #334155;width:20px;height:20px}</style>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
<div id="map"></div>
<script>
(function(){
  var map=L.map('map',{zoomControl:true}).setView([${DEFAULT_CENTER.latitude},${DEFAULT_CENTER.longitude}],12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
  var marker=null;
  var readOnly=${readOnly ? 'true' : 'false'};
  function sendPoint(point){if(!readOnly)window.ReactNativeWebView.postMessage(JSON.stringify({latitude:point.lat,longitude:point.lng}));}
  function setPoint(lat,lng,zoom){
    var point=L.latLng(lat,lng);
    map.setView(point,zoom||16);
    if(!marker){marker=L.marker(point,{draggable:!readOnly}).addTo(map);if(!readOnly)marker.on('dragend',function(e){sendPoint(e.target.getLatLng());});}
    else marker.setLatLng(point);
  }
  if(!readOnly)map.on('click',function(e){setPoint(e.latlng.lat,e.latlng.lng);sendPoint(e.latlng);});
  window.setRequestLocation=setPoint;
  window.ReactNativeWebView.postMessage(JSON.stringify({ready:true}));
})();
</script>
</body>
</html>`;

interface LeafletPinMapProps {
  latitude: number | null;
  longitude: number | null;
  onCoordinateSelect: (latitude: number, longitude: number) => void;
  readOnly?: boolean;
}

export function LeafletPinMap({ latitude, longitude, onCoordinateSelect, readOnly = false }: LeafletPinMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady || latitude == null || longitude == null) return;
    const script = `window.setRequestLocation(${latitude},${longitude},16); true;`;
    webViewRef.current?.injectJavaScript(script);
  }, [isReady, latitude, longitude]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { ready?: boolean; latitude?: number; longitude?: number };
      if (message.ready) {
        setIsReady(true);
        return;
      }
      if (!readOnly && Number.isFinite(message.latitude) && Number.isFinite(message.longitude)) {
        onCoordinateSelect(message.latitude as number, message.longitude as number);
      }
    } catch {
      // Ignore malformed messages from the embedded map.
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: createLeafletHtml(readOnly) }}
        originWhitelist={['*']}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 10,
  },
  webView: {
    backgroundColor: 'transparent',
  },
});
