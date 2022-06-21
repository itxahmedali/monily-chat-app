import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import {AsyncStorage} from 'react-native';
export default function App() {
  const [socket, setSocket] = useState(
    io('https://monily-chat-server.herokuapp.com'),
    // io('http://192.168.18.109:3000'),
  );
  const [messageList, setMessageList] = useState([]);
  const [message, setMessage] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loginId, setloginId] = useState();
  const [selectedUser, setselectedUser] = useState();
  const [loginform, setLoginform] = useState(true);
  const [chatComponent, setChatComponent] = useState(false);
  const users = [
    {
      username: 'monily',
      password: '123',
      id: '1',
    },
    {
      username: 'ahmed',
      password: '123',
      id: '2',
    },
  ];
  const storeData = async value => {
    try {
      await AsyncStorage.setItem('id', value);
    } catch (e) {}
  };
  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('id');
      if (value != null) {
        setloginId(value)
        setLoginform(false);
      }
    } catch (error) {}
  };
  const clearAsyncStorage = async () => {
    AsyncStorage.clear();
  };
  function login() {
    let user = users.find(x => x.username === email && x.password === password);
    if (user) {
      storeData(user.id);
      setTimeout(() => {
        getData();
      });
    } else {
    }
  }
  function selectUser(id) {
    setselectedUser(id);
    setChatComponent(true);
  }
  useEffect(() => {
    // clearAsyncStorage()
    getData();
    socket.on('message', message => {
      setMessageList(oldValue => [...oldValue, JSON.parse(message)]);
    });
  }, []);
  function sendMessage() {
    if (message == '' || message == null) {
      return;
    } else {
      socket.emit('message', {message: message, senderId: loginId, recieverId: selectedUser});
    }
  }

  return (
    <View style={style.container}>
      {loginform == true ? (
        <View>
          <TextInput
            autoCorrect={false}
            style={style.LogintextInput}
            onChangeText={e => {
              setEmail(e);
            }}></TextInput>
          <TextInput
            autoCorrect={false}
            style={style.LogintextInput}
            onChangeText={e => {
              setPassword(e);
            }}></TextInput>
          <TouchableOpacity style={style.loginButton} onPress={() => login()}>
            <Text style={style.sendMessage}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={style.container}>
          {chatComponent == false ? (
            <View>
              <Text style={style.userHead}>Users</Text>
              <FlatList
                data={users}
                renderItem={({item}) => (
                  <TouchableOpacity onPress={() => selectUser(item.id)}>
                    {
                      item.id != loginId ? (
                        <Text style={style.recieveMessage}>{item.username}</Text>
                      ) : <View></View>
                    }
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : (
            <View style={style.container}>
              <View style={style.MessageBox}>
                <FlatList
                  data={messageList}
                  renderItem={({item}) => (
                    <Text style={item.senderId == loginId && item.recieverId != loginId ? style.sendMessage : style.recieveMessage}>{item.message}</Text>
                  )}
                />
              </View>
              <View style={style.messageInput}>
                <TextInput
                  autoCorrect={false}
                  style={style.textInput}
                  onChangeText={e => {
                    setMessage(e);
                  }}></TextInput>
                <TouchableOpacity
                  style={style.sendButton}
                  onPress={() => sendMessage()}>
                  <Text style={style.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
const style = StyleSheet.create({
  userHead: {
    fontSize: 30,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  sendButtonText: {
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#000',
    padding: 16,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  messageInput: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  MessageBox: {},
  recieveMessage: {
    color: '#fff',
    padding: 10,
  },
  sendMessage: {
    color: '#fff',
    marginLeft: 'auto',
    padding: 10,
  },
  textInput: {
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    color: '#000',
  },
  LogintextInput: {
    backgroundColor: '#fff',
    width: '100%',
    color: '#000',
    marginTop: 30,
  },
  loginButton: {
    backgroundColor: '#000',
    padding: 16,
  },
});
