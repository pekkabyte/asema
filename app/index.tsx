import { View, ScrollView, FlatList, TextInput, Pressable, Text } from "react-native";
import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';
import { useState } from 'react';
import * as Crypto from 'expo-crypto';
import { Image } from 'expo-image';
import {Dimensions} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants'
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
  const [text, onChangeText] = useState("yle.fi/news");
  const [url, setUrl] = useState("yle.fi/news");
  const [contents, setContents] = useState<Array<Dictionary>>([]);
  const [menuVisible, setMenuVisiblity] = useState(false);
  const [characterLocation, setCharacterLocation] = useState(-24); 
  const contentStartingTags = "<html><head><meta name='viewport' content='width=width, initial-scale=1' /></head><body>";
  const contentEndingTags = "</body></html>";

  function handleSubmit() {
    setUrl(text);
    fetch("https://yle.fi/rss/news")
      .then(response => response.text())
      .then((html) => {
        const document = parse5.parse(html);
        // const results = getElementsByClass(document, "sp-code-editor");
        const results = getRSSElements(document, "item"); 
        for (let result of results) {
          // const content: string = parse5.serialize(result);
          setContents(state => ([...state, {"id": Crypto.randomUUID(), "string": result}]));
        }
      })
  }

  function getRSSElements(node: Node, tag: string): Array<string> {
    var results = new Array<string>();
    var concatString = ""
    for (let i=0; i<node.childNodes?.length; i++) {
      var element = node.childNodes[i] as Element;
      for (const [key, value] of Object.entries(element)) {
        if (key == "tagName" && value == "item") {
          // console.log(element)
          for (let j=0; j<element.childNodes?.length; j++) {
            var childElement = element.childNodes[j] as Element;
            for (const [childKey, childValue] of Object.entries(childElement)) {
              // console.log(childKey+", "+childValue)
              if (childKey == "tagName" && childValue == "title") {
                for (let k=0; k<childElement.childNodes?.length; k++) {
                  var titleNode = childElement.childNodes[k] as Element;
                  for (const [titleNodeKey, titleNodeValue] of Object.entries(titleNode)) {
                    if (titleNodeKey == "value") {
                      concatString = concatString.concat(titleNodeValue+"\n\n")
                    }
                  }
                }
              }
              if (childKey == "nodeName" && childValue == "#text") {
                for (const [linkNodeKey, linkNodeValue] of Object.entries(childElement)) {
                  if (linkNodeKey == "value") {
                    concatString = concatString.concat(linkNodeValue+"\n\n")
                  }
                }
              }
              if (childKey == "tagName" && childValue == "description") {
                for (let k=0; k<childElement.childNodes?.length; k++) {
                  var descriptionNode = childElement.childNodes[k] as Element;
                  for (const [descriptionNodeKey, descriptionNodeValue] of Object.entries(descriptionNode)) {
                    if (descriptionNodeKey == "value") {
                      concatString = concatString.concat(descriptionNodeValue)
                    }
                  }
                }
              }
            }
          }
          if (concatString != "") {
            results.push(concatString)
            concatString = ""
          }
        }
      }
      const result = getRSSElements(node.childNodes[i], tag);
      if (result.length > 0) {
        results = results.concat(result);
      }
    }
    return results;
  }

  function getElementsByTag(node: Node, tag: string): Array<Element> {
    var results = new Array<Element>();
    for (let i=0; i<node.childNodes?.length; i++) {
      var element = node.childNodes[i] as Element;
      for (const [key, value] of Object.entries(element)) {
        if (key == "tagName" && value == tag) {
          results.push(element);
        }
      }
      const result = getElementsByTag(node.childNodes[i], tag);
      if (result.length > 0) {
        results = results.concat(result);
      }
    }
    return results;
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
      <View style={{width: windowWidth, height: windowHeight, top: 34}}
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
            const size = event.nativeEvent.contentSize
            webViewContentSize.value = {
              width: size.width,
              height: size.height,
            };
          }}
          // onLoadEnd={handleSubmit}
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
    if (webViewContentOffset.value.y >= webViewContentSize.value.height) {
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
      {/* <StatusBar backgroundColor="#262626" translucent={true} /> */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyles}>
          <FlatList
            data={DATA}
            renderItem={({item}) => <Item />}
            keyExtractor={item => item.id}
            horizontal={true}
          />
          <View style={{width:48, height:52, position: 'absolute', top: '51%', right: characterLocation, display: 'none'}}>
            <Pressable
              onTouchEnd={() => {
                setMenuVisiblity(!menuVisible);
                setCharacterLocation(menuVisible ? -24 : 0);
                }}>
            <Image source={require('@/assets/images/character_front.png')} 
              style={{width:48, height:52}}/>
            </Pressable>
          </View>
          <Image source={require('@/assets/images/adaptive-icon-long.svg')} 
              style={{width:100, height:1000, position: 'absolute', top: 4, left: windowWidth-25}}/>
          <View style={styles.gameBackground}>
            <TextInput
              style={styles.addressBar}
              onChangeText={onChangeText}
              onSubmitEditing={handleSubmit}
              value={text}/>
            <ScrollView 
              style={styles.inventory}
              // horizontal={true}
              snapToAlignment="center">
              {contents && contents.map && contents.map(content =>
                <View
                  style={styles.contentCard}
                  key={content.id}>
                  {/* <WebView 
                    source={{html: contentStartingTags+content.string+contentEndingTags}}
                  /> */}
                  <Text style={{color: "white"}}>{content.string}</Text>
                </View>
              )}
            </ScrollView>
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
    height: windowHeight,
    position: 'absolute', 
    top: 20,
    left: windowWidth+45, 
    backgroundColor: '#000000',
  },
  addressBar: {
    width: '75%', 
    // marginTop: "5%",
    // marginLeft: "5%", 
    // paddingLeft: 5,
    // paddingRight: 5, 
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
    // height: windowHeight*0.25,
    // lineHeight: windowHeight*0.25,
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 25, 
    backgroundColor: '#262626',
    padding: 10, 
    // marginLeft: 20
  }, 
});