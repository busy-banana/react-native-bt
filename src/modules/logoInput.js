import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

export default class LogoInput extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {width, height} = this.props.style;
    return (
      <View style={{width:width, height:height, alignItems: 'flex-start'}}>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Image
            style={{height: height* 0.4,width: width* 0.3}}
            source={this.props.img}
            resizeMode={Image.resizeMode.stretch}
          />
          <Text style={styles.title}>{this.props.text}</Text>
        </View>
        <TextInput
          editable={false}
          value={this.props.inputValue}
          style={[styles.inputText,{height: height* 0.6,width: width}]}
          underlineColorAndroid='transparent'
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  title: {
    color: '#000',
    fontSize: 12
  },
  inputText: {
    borderWidth: 1.5,
    borderRadius: 8,
    color: '#000',
    fontSize: 20,
    padding: 0,
    textAlign: 'center',
  },
});