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
    setUrl(text);
    fetch(url)
      .then(response => response.text())
      .then((html) => {
        const document = parse5.parse(html);
        console.log(getElementsByClass(document, "sp-code-editor"));
      })
  }

  function getElementsByClass(node: Node, className: string): Array<Element> {
    interface Dictionary {
      [key: string]: string;
    }

    var results = new Array<Element>();
    for (let i=0; i<node.childNodes?.length; i++) {
      var element = node.childNodes[i] as Element;
      var attrs = new Array();
      for (const [key, value] of Object.entries(element)) {
        if (key == "attrs") {
          attrs.push(value);
        }
      }
      for (let j=0; j<attrs.length; j++) {
        for (const [key, value] of Object.entries(attrs[j])) {
          const dict = value as Dictionary;
          if (dict.name == "class" && dict.value.includes(className)) {
            results.push(element);
          }
        }
      }
      const result = getElementsByClass(node.childNodes[i], className);
      if (result.length > 0) {
        results = results.concat(result);
      }
    }
    return results;
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