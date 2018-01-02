react-native-bluetooth-serial源码更改:  （后期封装）
1、module添加writeHexToDevice
2、添加DEVICE_READ事件监听中的handleData()方法，不使用默认的readUntil()
3、取消覆写RCTBluetoothSerialPackage文件中createJSModules