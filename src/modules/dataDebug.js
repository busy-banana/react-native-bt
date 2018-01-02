import React, { Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView
} from 'react-native';

export default class DataDebug extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const height = this.props.screenHeight;
    return (
      <ScrollView>
        <Modal
          animationType={"fade"}
          transparent={false}
          visible={true}
          onRequestClose={this.props.onBack}
        >
          <ScrollView>
            <ScrollView>
              <Text style={styles.title}>接收区</Text>
              <Text style={[styles.textContainer, {height: height*0.4}]}>{this.props.readDataArea}</Text>
            </ScrollView>
            <ScrollView>
              <Text style={styles.title}>发送区</Text>
              <ScrollView>
              <Text style={[styles.textContainer, {height: height*0.2}]}>{this.props.writeDataArea}</Text>
              </ScrollView>
            </ScrollView>
            <ScrollView>
              <KeyboardAvoidingView behavior='padding'>
                <TextInput
                  style={[styles.textContainer, {height: height*0.05}]}
                  onChangeText={this.props.onChangeText}
                  autoCorrect={false}
                />
              </KeyboardAvoidingView>
            </ScrollView>
            <View style={{flexDirection: 'row',justifyContent: 'space-around',marginTop: 5}}>
              <TouchableOpacity
                onPress={this.props.onWrite}  
                style={styles.titleBtn}
                activeOpacity={0.6}
              >
                <Text style={styles.btnText}>发送(Text)</Text>              
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.props.onWriteHex}  
                style={styles.titleBtn}
                activeOpacity={0.6}
              >
                <Text style={styles.btnText}>发送(Hex)</Text>              
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.props.onWriteCommand}  
                style={styles.titleBtn}
                activeOpacity={0.6}
              >
                <Text style={styles.btnText}>发送命令</Text>              
              </TouchableOpacity>
            </View>

            <View style={{flexDirection: 'row',justifyContent: 'space-around',marginTop: 10}}>
              <TouchableOpacity
                onPress={this.props.clearReadArea}  
                style={styles.titleBtn}
                activeOpacity={0.6}
              >
                <Text style={styles.btnText}>清除接收区</Text>              
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.props.clearWriteArea}  
                style={styles.titleBtn}
                activeOpacity={0.6}
              >
                <Text style={styles.btnText}>清除发送区</Text>              
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.props.onBack}
                style={styles.titleBtn}
                activeOpacity={0.6}
              >
                <Text style={styles.btnText}>返回</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>        
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  textContainer: {
    borderWidth: 1.5,
    borderColor: '#b1b1b1',
    backgroundColor: '#dfdfdf',
    margin: 6,
    color: '#000',
    fontSize: 11
  },
  title: {
    fontWeight: 'bold',
    color: '#4ec9ab',
  },
  titleBtn: {
    width: 90,
    height:35,
    backgroundColor: '#4ec9ab',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#fff'
  }
});