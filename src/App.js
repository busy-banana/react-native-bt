import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  Dimensions
} from 'react-native';
import DeviceList from './modules/deviceList';
import DataDebug from './modules/dataDebug';
import LogoInput from './modules/logoInput';
import Toast from '@remobile/react-native-toast';
import BluetoothSerial from 'react-native-bluetooth-serial';
import CompanyLogo from './images/company_logo.png';
import Cash from './images/cash.png';
import Card from './images/card.png';
import Coin from './images/coin.png';
import Contactless from './images/contactless.png';
import BluetoothOn from './images/bluetoothOn.png';
import BluetoothOff from './images/bluetoothOff.png';
import Signal0 from './images/signal0.png';
import Signal1 from './images/signal1.png';
import Signal2 from './images/signal2.png';
import Signal3 from './images/signal3.png';
import Signal4 from './images/signal4.png';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEnabled: false, //蓝牙开闭状态
      devices: [],
      unpairedDevices: [],
      connectedDevice: {},
      discovering: false, //设备搜索状态
      modalVisible: false,
      isDataDebug: false, //是否展示数据调试页面
      textInputValue: '',
      readData:{
        data: '',
        contactlessValue: '', //使用非接触式卡数量
        coinValue: '',  //代币数量
        cashValue: '',  //投币数量
        cardValue: '',  //适用磁卡数量
        IMEIValue: '',  //IMEI序列号
        versionNum: '', //版本号
        signalValue: 0, //信号值
      },
      writeDataArea: '',  //发送区数据展示
      readDataArea: '',  //接收区数据展示
      status: 'Unconnected', //顶部状态栏文字展示
      arrData: [],  //接收数据拼接
      dataStr: '',  //接收字符串拼接
    }
  }

  componentWillMount() {
    this.getInitData();
    BluetoothSerial.on('bluetoothEnabled',() => {
      BluetoothSerial.list().then((devices) => {
        this.setState({ devices, isEnabled: true });
        Toast.showShortTop('Bluetooth enabled');
      }).catch((err) => {
        Toast.showShortTop(`System Error: ${err.message}`);
      });
    });

    BluetoothSerial.on('bluetoothDisabled',() => {
      this.setState({devices: [], isEnabled: false, status: 'Unconnected'});
      Toast.showShortTop('Bluetooth disabled');
    });

    BluetoothSerial.on('error',(err) => console.log(`Error: ${err.message}`));
    
    BluetoothSerial.on('connectionLost',() => {
      if (this.state.connectedDevice) {
        Toast.showShortTop(`Connection to device ${this.state.connectedDevice.name} has been lost`);
      }
        this.timer && clearInterval(this.timer);      
        this.setState({ connectedDevice: {},  status: 'Unconnected'});
    });

    BluetoothSerial.on('read', data => this.handleReadData(data.data));
  }

  // componentWillUnmount() {
  //   BluetoothSerial.removeListener('bluetoothEnabled',() => {});
  //   BluetoothSerial.removeListener('bluetoothDisabled',() => {});
  //   BluetoothSerial.removeListener('error',() => {});
  //   BluetoothSerial.removeListener('connectionLost',() => {});
  //   BluetoothSerial.removeListener('read',() => {});
  //   this.timer && clearInterval(this.timer);
  // }

  //获取初始化数据
  getInitData() {
    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ]).then((values) => {
      const [isEnabled, devices] = values;
      this.setState({isEnabled, devices});
    }).catch((err) => {
      Toast.showShortTop(`System Error: ${err.message}`);
    })
  }

  //请求连接蓝牙
  connect(device){
    BluetoothSerial.connect(device.id).then((res) => {
      Toast.showShortTop(`Connected to device ${device.name}`);
      this.setState({
        connectedDevice: {id: device.id, name: device.name},
        modalVisible: false,
        status: `${device.name} connected successfully`
      });
      this.timer = setInterval(() => {
        this.writeHexToDevice();
      },3000);
    }).catch((err) => {
      Toast.showShortTop(`${device.name} connecting failed, ${err.message}`)
    })
  }

  //请求配对蓝牙 Android Only
  pairDevice(device){
    BluetoothSerial.pairDevice(device.id).then((res) => {
      if (res) {
        let devices = this.state.devices;
        devices.push(device);
        Toast.showShortTop(`Device ${device.name} paired successfully`);
        this.setState({
          devices,
          unpairedDevices: this.state.unpairedDevices.filter((e) => {return e.id != device.id})
        });
      } else {
        Toast.showShortTop(`Device ${device.name} pairing failed`)
      }
    }).catch((err) => {
      Toast.showShortTop(err.message)  
    }) 
  }

  //搜索可配对设备 Android Only
  discoverUnpairedDevices() {
    if (this.state.discovering) {
      return false;
    } else if (!this.state.isEnabled) {
      Toast.showShortTop('Please open bluetooth first')
    } else {
      Toast.showShortTop('Please open location permission to search accurately');
      this.setState({discovering: true});    
      BluetoothSerial.discoverUnpairedDevices().then((unpairedDevices) => {
          this.setState({ unpairedDevices, discovering: false })
      }).catch((err) => {
        Toast.showShortTop(err.message)
      }) 
    }
  }

   //向蓝牙设备发送String数据
  write() {
    const message = this.state.textInputValue;
    if (!this.state.connectedDevice.id) {      
      Toast.showShortTop('Please connect to device first')
    } else {
      BluetoothSerial.write(message)
      .then((res) => {
        this.setState({
          writeDataArea: this.state.writeDataArea + ' ' + message
        })
      }).catch((err) => {
        Toast.showShortTop(err.message)
      })
    }
  }

  //把16进制转换为bytes发送给蓝牙设备
  writeHexToDevice() {
    //查询命令
    const queryCommand = 'FB FB 00 05 0C 00 00 07 F0';
    if (!this.state.connectedDevice.id) {
      Toast.showShortTop('Please connect to device first')
    } else {
      BluetoothSerial.writeHexToDevice(queryCommand)
      .then((res) => {
        this.setState({
          writeDataArea: this.state.writeDataArea+ ' ' + queryCommand,
          status: 'Sending command, wait for response...'
        })
      })
      .catch((err) => {
        Toast.showShortTop(err.message)
      })
    }
  }

  //数据调试页面(把16进制转换为bytes发送给蓝牙设备)
  writeHexToDeviceDebug() {
    const message = this.state.textInputValue;
    if (!this.state.connectedDevice.id) {
      Toast.showShortTop('Please connect to device first')
    } else {
      BluetoothSerial.writeHexToDevice(message)
      .then((res) => {
        this.setState({
          writeDataArea: this.state.writeDataArea+ ' ' + message
        })
      })
      .catch((err) => {
        Toast.showShortTop(err.message)
      })
    }
  }

  handleRealData(realArr, realData, readDataArea) {
    if (realArr.length > 37) {
      this.setState({
        status: 'Fail to retrieve data from device',
        arrData: [],
        dataStr: '',
        readDataArea: readDataArea        
      })
    } else if (realArr.length == 37) {
      if (realArr[0] != 'f5' || realArr[1] != 'f5') {
        this.setState({
          status: 'Fail to retrieve data from device',
          arrData: [],
          dataStr: '',
          readDataArea: readDataArea          
        });
      } else {
        //调试数据
        this.state.readData.data = realArr.join(' ');
        //非数据调试
        this.state.readData.IMEIValue = realData.slice(5,20);
        const str = realData.slice(21,36);
        let arr = [];
        for(let i = 0; i < 15; i++){
          arr.push(str.charCodeAt(i).toString(16));
        }
        this.state.readData.versionNum = parseInt(arr[0],16) + '.' + parseInt(arr[1],16);
        this.state.readData.signalValue = parseInt(arr[2],16);
        this.state.readData.contactlessValue = parseInt((arr[3]+arr[4]+arr[5]+arr[6]),16)/100 + '';
        this.state.readData.cashValue = parseInt((arr[7]+arr[8]+arr[9]+arr[10]),16)/100 + '';
        this.state.readData.coinValue = parseInt((arr[11]+arr[12]),16) + '';
        this.state.readData.cardValue = parseInt((arr[13]+arr[14]),16) + '';
        this.setState({
          readData: this.state.readData,
          status: 'Retrieve data from device correctly',
          arrData: [],
          dataStr: '',
          readDataArea: readDataArea          
        });
      }
    } else {
      this.setState({
        arrData: realArr,
        dataStr: realData,
        readDataArea: readDataArea
      });
    }
  }

  //处理接受数据
  handleReadData(data) {
    let arrData = [], testData = '';
    for(let j = 0; j < data.length; j++){
      let m = data.charCodeAt(j).toString(16) < 10 ? '0' + data.charCodeAt(j).toString(16) : data.charCodeAt(j).toString(16);
      arrData.push(m);
    }
    testData = arrData.join(' ');
    const realArr = this.state.arrData.concat(arrData);
    const realData = this.state.dataStr + data;
    const readDataArea = this.state.readDataArea == '' ? testData : this.state.readDataArea + ' ' + testData;
    this.handleRealData(realArr, realData, readDataArea);

    // if (data.length == 37) {
    //   let arrData = [];
    //   for(let j = 0; j< 37; j++){
    //     let m = data.charCodeAt(j).toString(16) < 10 ? '0' + data.charCodeAt(j).toString(16) : data.charCodeAt(j).toString(16);
    //     arrData.push(m);
    //   }
    //   if (arrData[0] != 'f5' || arrData[1] != 'f5') {
    //     this.setState({
    //       status: 'Fail to retrieve data from device'
    //     });
    //   } else {
    //     //调试数据
    //     this.state.readData.data = arrData.join(' ');
    //     //非数据调试
    //     this.state.readData.IMEIValue = data.slice(5,20);
    //     const str = data.slice(21,34);
    //     let arr = [];
    //     for(let i = 0; i< 13; i++){
    //       arr.push(str.charCodeAt(i).toString(16));
    //     }
    //     this.state.readData.versionNum = parseInt((arr[0]+arr[1]),16) + '';
    //     this.state.readData.signalValue = parseInt(arr[2],16);
    //     this.state.readData.contactlessValue = parseInt((arr[3]+arr[4]),16) + '';
    //     this.state.readData.cashValue = parseInt((arr[5]+arr[6]+arr[7]+arr[8]),16)/100 + '';
    //     this.state.readData.coinValue = parseInt((arr[9]+arr[10]),16) + '';
    //     this.state.readData.cardValue = parseInt((arr[11]+arr[12]),16) + '';
    //     this.setState({
    //       readData: this.state.readData,
    //       readDataArea: this.state.readDataArea + ' ' + this.state.readData.data,
    //       status: 'Retrieve data from device correctly'
    //     });
    //   }
    // } else {
    //   this.setState({
    //     status: 'Fail to retrieve data from device'
    //   });
    // }
  }

  //点击设备列表，连接设备
  connectDeivce(device) {
    if (this.state.connectedDevice && this.state.connectedDevice.id == device.id) {
      Toast.showShortTop(`Device ${device.name} connected successfully`)
    } else if (!!this.state.connectedDevice.id) {
      BluetoothSerial.disconnect()
        .then(() => {this.connect(device)})
        .catch((err) => Toast.showShortTop(err.message))
    } else {
      this.connect(device);
    }
  }

  //打开Modal浮层
  onModalOpen() {
    if (!this.state.modalVisible) {
      this.setState({modalVisible: true});
    }
  }

  //关闭Modal浮层
  onModalClose() {
    if (this.state.modalVisible) {
      this.setState({modalVisible: false});
    }
  }

  //打开数据调试页面
  showDataDebug() {
    if (!this.state.isDataDebug && this.state.connectedDevice.id) {
      this.timer && clearInterval(this.timer);
      this.setState({isDataDebug: true})
    } else {
      Toast.showShortTop('Please connect to device first')
    }
  }

  //返回首页
  onBack() {
    if (this.state.isDataDebug) {
      this.timer = setInterval(() => {
        this.writeHexToDevice();
      },3000);
      this.setState({isDataDebug: false});
    }
  }

  //同步输入框的值
  handleTextInputChange(textInputValue) {
    this.setState({textInputValue});
  }

  handleSignalValue(value) {
    let imgSrc = '';
    if (value == 0 || value > 31) {
      imgSrc = Signal0;
    } else if (value >= 1 && value <= 10) {
      imgSrc = Signal1;
    } else if ( value > 10 && value <= 20) {
      imgSrc = Signal2;
    } else if ( value > 20 && value <= 25) {
      imgSrc = Signal3;
    } else if ( value > 25 && value <= 31) {
      imgSrc = Signal4;
    }
    return imgSrc;
  }

  //调试页面清除发送区数据
  clearWriteArea() {
    this.setState({ writeDataArea: ''})
  }
  
  //调试页面清除接收区数据
  clearReadArea() {
    this.setState({ readDataArea: ''})
  }

  render() {
    const {height, width} = Dimensions.get('window');
    const logoInputSize = {width: width*0.4,height: height*0.13};
    const versionNum = this.state.readData.versionNum ? 'v'+this.state.readData.versionNum : 'Ver';
    const signalImgSrc = this.handleSignalValue(this.state.readData.signalValue);
    const bluetoothLogo = this.state.connectedDevice.id ? BluetoothOn : BluetoothOff;
    const dataDebug = this.state.isDataDebug ? (
      <DataDebug
        readDataArea={this.state.readDataArea}
        writeDataArea={this.state.writeDataArea}
        onWrite={this.write.bind(this)}
        onWriteHex={this.writeHexToDeviceDebug.bind(this)}
        onWriteCommand={this.writeHexToDevice.bind(this)}
        onBack={this.onBack.bind(this)}
        onChangeText={this.handleTextInputChange.bind(this)}
        screenHeight={height}
        clearWriteArea={this.clearWriteArea.bind(this)}
        clearReadArea={this.clearReadArea.bind(this)}
    />) : null;

    const searchLoading = this.state.discovering ? (
      <View style={{position:'relative',bottom:height*0.25}}>
          <ActivityIndicator
            color='#426ac7'
            size={35}
          />
      </View>
    ) : null;
    return (
      <View style={styles.container}>
        <View style={[styles.topBar, {height: height*0.06}]}>
          <Image
            style={{height: height*0.03,width: width*0.07}}
            source={bluetoothLogo}
            resizeMode={Image.resizeMode.stretch}
          />
          <Text style={[styles.topBarText,{width: width*0.75, textAlign: 'center', fontSize: 12}]}>{this.state.status}</Text>
          <Text style={[styles.topBarText,{width: width*0.11, textAlign: 'left'}]} onLongPress={this.showDataDebug.bind(this)}>{versionNum}</Text>
          <Image
            style={{height: height*0.03,width: width*0.07,opacity: 0.8}}
            source={signalImgSrc}
            resizeMode={Image.resizeMode.stretch}
          />
        </View>

        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <Image
            style={{height: height* 0.1,width: width*0.35}}
            source={CompanyLogo}
            resizeMode={Image.resizeMode.stretch}
          />
          <View style={{justifyContent:'center', alignItems:'center',marginRight:width*0.1}}>
            <Text style={{color:'#000'}}>IMEI</Text>
            <TextInput
              editable={false}
              value={this.state.readData.IMEIValue}
              style={[styles.IMEIInput,{height: height* 0.04,width: width*0.45}]}
              underlineColorAndroid='transparent'
            />
          </View>
        </View>

        <View style={styles.logoInputContainer}>
          <LogoInput
            img={Contactless}
            text='CONTACTLESS'
            inputValue={this.state.readData.contactlessValue}
            style={logoInputSize}
          />
          <LogoInput
            img={Cash}
            text='EFECTIVO'
            inputValue={this.state.readData.cashValue}
            style={logoInputSize}
          />
        </View>
        <View style={styles.logoInputContainer}>
          <LogoInput
            img={Coin}
            text='FICHAS'
            inputValue={this.state.readData.coinValue}
            style={logoInputSize}
          />
          <LogoInput
            img={Card}
            text='MAGSTIPE'
            inputValue={this.state.readData.cardValue}
            style={logoInputSize}
          />
        </View>

        <Modal
          animationType={'none'}
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {this.onModalClose.bind(this)}}
        >
          <TouchableOpacity
            style={styles.modalView}
            onPress={this.onModalClose.bind(this)}
          >
            <View style={{width:width*0.7, backgroundColor:'#000', justifyContent:'center'}}>
              <View style={{height: height*0.3}}>
                <Text style={styles.modalTitle}>Unconnected Devices</Text>
                <DeviceList
                  devices={this.state.devices}
                  showConnectedIcon={true}
                  connectedId={this.state.connectedDevice.id || ''}
                  onPressCallback={this.connectDeivce.bind(this)}
                />
              </View>
              <View style={{height: height*0.3}}>
                <Text style={styles.modalTitle}>Unpaired Deivces</Text>
                <DeviceList
                  devices={this.state.unpairedDevices}
                  showConnectedIcon={false}
                  connectedId={this.state.connectedDevice.id || ''}
                  onPressCallback={this.pairDevice.bind(this)}
                />
              </View>
              { Platform.OS == 'android' ? 
                (<TouchableOpacity 
                  style={[styles.searchDeviceBtn,{height: height*0.07}]}
                  onPress={this.discoverUnpairedDevices.bind(this)}
                >
                  <Text style={styles.searchDeviceTitle}>
                      Search
                  </Text>
                </TouchableOpacity>) : null }
            </View>

            {searchLoading}

          </TouchableOpacity>
        </Modal>

        {dataDebug}

        <View style={{height: height*0.1, flexDirection:'row', justifyContent:'space-around', marginTop: 60}}> 
          <TouchableOpacity
            style={[styles.footerBtn,{width: width*0.38}]}
            onPress={this.writeHexToDevice.bind(this)}            
          >
            <Text style={styles.btnText}>
              Query
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerBtn,{width: width*0.38}]}
            onPress={this.onModalOpen.bind(this)}
          >
            <Text style={styles.btnText}>
              Connect
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#50B547',
  },
  topBarText: {
    color: '#fff',
    fontSize: 14,
  },
  IMEIInput: {
    borderWidth: 1,
    borderRadius: 2,
    color: '#000',
    fontSize: 14,
    padding: 0,
    textAlign: 'center',
  },
  logoInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40
  },
  footerBtn: {
    backgroundColor: '#426ac7',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
  },
  modalView: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#666'
  },
  searchDeviceBtn: {
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor: '#666',
  },
  searchDeviceTitle: {
    color: '#fff',
    fontSize: 18
  }
});