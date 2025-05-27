import { TextInput } from "react-native";
import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
const parse5 = require('parse5');

export default function Index() {
  const [text, onChangeText] = useState("https://react.dev");
  const [url, setUrl] = useState("https://react.dev");

  function handleSubmit() {
    setUrl(text)

    const document = parse5.parse('<!DOCTYPE html><html><head></head><body>Hi there!</body></html>');

    console.log(document.childNodes[1].tagName); //> 'html'
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: url }}
      />
      <WebView
        source={{ uri: url }}
      />
      <TextInput
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        value={text}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});