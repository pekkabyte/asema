import { View, ScrollView, FlatList, TextInput, Pressable } from "react-native";
import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';
import { useState } from 'react';
import * as Crypto from 'expo-crypto';
import { Image } from 'expo-image';
import {Dimensions} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
const parse5 = require('parse5');
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const panOffset = useSharedValue({ x: 0, y: 0 });
const start = useSharedValue({ x: 0, y: 0 });
const webViewContentOffset = useSharedValue({ x: 0, y: 0 });
const webViewContentSize = useSharedValue({ width: 0, height: 0 });

export default function Index() {
  interface Dictionary {
    [key: string]: string;
  }
  const [text, onChangeText] = useState("https://react.dev");
  const [url, setUrl] = useState("https://react.dev");
  const [contents, setContents] = useState<Array<Dictionary>>([]);
  const [menuVisible, setMenuVisiblity] = useState(false);
  const [characterLocation, setCharacterLocation] = useState(-24); 
  const contentStartingTags = "<html><head><meta name='viewport' content='width=width, initial-scale=1' /></head><body>";
  const contentEndingTags = "</body></html>";

  function handleSubmit() {
    setUrl(text);
    fetch(url)
      .then(response => response.text())
      .then((html) => {
        const document = parse5.parse(html);
        const results = getElementsByClass(document, "sp-code-editor");
        for (let result of results) {
          const content: string = parse5.serialize(result);
          setContents(state => ([...state, {"id": Crypto.randomUUID(), "string": content}]));
        }
      })
  }

  function getElementsByClass(node: Node, className: string): Array<Element> {
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

  const DATA = [
    {
      id: url,
    },
  ];

  let webViewRef: WebView | null;

  const Item = () => (
      <View style={{width: windowWidth, height: windowHeight}}
        pointerEvents="none">
        <WebView
          ref={webView => {webViewRef = webView}}
          source={{ uri: url }}
          onScroll={(event) => {
            const offset = event.nativeEvent.contentOffset
            webViewContentOffset.value = {
              x: offset.x,
              y: offset.y,
            };
            // console.log(offset)
            const size = event.nativeEvent.contentSize
            webViewContentSize.value = {
              width: size.width,
              height: size.height,
            };
            // console.log(event.nativeEvent.zoomScale)
          }}
        />
      </View>
  );

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      panOffset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      start.value = {
        x: panOffset.value.x,
        y: panOffset.value.y,
      };
    })
    .onTouchesUp(() => {
      start.value = {
        x: 0,
        y: panOffset.value.y,
      };
    })

  const animatedStyles = useAnimatedStyle(() => {
    // console.log(webViewContentOffset.value.y+" >= "+webViewContentSize.value.height+", "+webViewContentOffset.value.y+" <= 0, "+panOffset.value.y+" < 0")
    if ((webViewContentOffset.value.y >= webViewContentSize.value.height) ||
        (webViewContentOffset.value.y <= 0)) {
      return {
          transform: [
            { translateX: Math.min(panOffset.value.x, 0) },
            { translateY: panOffset.value.y },
          ],
      }
    } else {
      return {
          transform: [
            { translateX: Math.min(panOffset.value.x, 0) },
            { translateY: 0 },
          ],
      }
    }
  });

  const scrollWebView = (x: number, y: number) => {
    webViewRef?.injectJavaScript('window.scroll('+-x+', '+-y+')')
    // webViewRef?.injectJavaScript('window.ReactNativeWebView.postMessage()')
  }

  useAnimatedReaction(
    () => {
      return panOffset.value;
    },
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        scheduleOnRN(scrollWebView, currentValue.x, currentValue.y);
      }
    }
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden={true} />
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyles}>
          <FlatList
            data={DATA}
            renderItem={({item}) => <Item />}
            keyExtractor={item => item.id}
            horizontal={true}
          />
          {menuVisible && 
            <View style={styles.gameBackground}>
              <TextInput
                style={styles.addressBar}
                onChangeText={onChangeText}
                onSubmitEditing={handleSubmit}
                value={text}/>
              <ScrollView 
                style={styles.inventory}
                horizontal={true}
                snapToAlignment="center">
                {contents && contents.map && contents.map(content =>
                  <View
                    style={styles.contentCard}
                    key={content.id}>
                    <WebView 
                      source={{html: contentStartingTags+content.string+contentEndingTags}}
                    />
                  </View>
                )}
              </ScrollView>
            </View>
          }
          <View style={{width:48, height:52, position: 'absolute', top: '51%', right: characterLocation}}>
            <Pressable
              onTouchEnd={() => {
                setMenuVisiblity(!menuVisible);
                setCharacterLocation(menuVisible ? -24 : 0);
                }}>
            <Image source={require('@/assets/images/character_front.png')} 
              style={{width:48, height:52}}/>
            </Pressable>
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black'
  },
  gameBackground: {
    width: windowWidth,
    height: windowHeight*0.55,
    position: 'absolute', 
    top: '50%', 
    backgroundColor: '#000000'
  },
  addressBar: {
    width: '75%', 
    marginTop: "5%",
    marginLeft: "5%", 
    paddingLeft: 5,
    paddingRight: 5, 
    color: 'white', 
    fontSize: 20, 
    fontStyle: 'normal',
    fontWeight: '800'
  }, 
  inventory: {
    width: windowWidth,
    height: windowHeight*0.4,
  }, 
  contentCard: {
    width: windowWidth*0.85,
    height: windowHeight*0.39,
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 25, 
    backgroundColor: 'white',
    padding: 10, 
    marginLeft: 20
  }, 
});