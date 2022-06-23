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
import Notifications from './Notifications';
export default function App() {
  const [socket, setSocket] = useState(
    // io('https://monily-chat-server.herokuapp.com'),
    io('http://192.168.18.109:3000'),
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
    {
      username: 'farwah',
      password: '123',
      id: '3',
    },
    {
      username: 'azeem',
      password: '123',
      id: '4',
    },
    {
      username: 'abuzar',
      password: '123',
      id: '5',
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
        setloginId(value);
        setLoginform(false);
      }
    } catch (error) {}
  };
  const clearAsyncStorage = async () => {
    AsyncStorage.clear();
  };
  function back() {
    setChatComponent(false);
  }
  function logout() {
    clearAsyncStorage();
    setLoginform(true);
  }
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
  const setNotification = () => {
    // Notifications.schduleNotification(date);
    Notifications.schduleNotification(new Date(Date.now() + 5 * 1000));
  };
  useEffect(() => {
    getData();
    // clearAsyncStorage()
    socket.on('message', message => {
      setMessageList(oldValue => [...oldValue, JSON.parse(message)]);
    });
  }, []);
  function sendMessage() {
    if (message == '' || message == null) {
      return;
    } else {
      socket.emit('message', {
        message: message,
        senderId: loginId,
        recieverId: selectedUser,
      });
    }
  }

  return (
    <View style={style.container}>
      {loginform == true ? (
        <View style={style.loginForm}>
          <Text style={style.loginHead}>Login</Text>
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
          <TouchableOpacity style={style.loginButton} onPress={() => [login(),setNotification()]}>
            <Text style={style.Logintext}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={style.container}>
          {chatComponent == false ? (
            <View>
              <TouchableOpacity
                style={style.logoutButtonBox}
                onPress={() => logout()}>
                <Text style={style.LogouttextInput}>Back</Text>
              </TouchableOpacity>
              <Text style={style.userHead}>Users</Text>
              <FlatList
                data={users}
                renderItem={({item, index}) => (
                  <TouchableOpacity onPress={() => selectUser(item.id)}>
                    {item.id != loginId ? (
                      <Text style={style.recieveMessage}>
                        {' '}
                        {index}. {item.username}
                      </Text>
                    ) : (
                      <View></View>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : (
            <View style={style.container}>
              <TouchableOpacity
                style={style.logoutButtonBox}
                onPress={() => back()}>
                <Text style={style.LogouttextInput}>Back</Text>
              </TouchableOpacity>
              <View style={style.messageStart}>
                <View style={style.MessageBox}>
                  <FlatList
                    data={messageList}
                    renderItem={({item}) => {
                      if (
                        item.senderId == loginId &&
                        item.recieverId == selectedUser &&
                        item.senderId != selectedUser
                      ) {
                        return (
                          <View>
                            <Text style={style.sendMessage}>
                              {item.message}
                            </Text>
                          </View>
                        );
                      }
                      if (
                        item.senderId == selectedUser &&
                        item.recieverId == loginId &&
                        item.senderId != loginId
                      ) {
                        return (
                          <View>
                            <Text style={style.recieveMessage}>
                              {item.message}
                            </Text>
                          </View>
                        );
                      }
                    }}
                  />
                </View>
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
  messageStart: {
    marginTop: 80,
  },
  loginForm: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  logoutButtonBox: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  userHead: {
    fontSize: 30,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 50,
  },
  loginHead: {
    fontSize: 30,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
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
    width: '80%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  LogouttextInput: {
    backgroundColor: '#fff',
    color: '#000',
    padding: 10,
  },
  Logintext: {
    backgroundColor: '#fff',
    color: '#000',
    padding: 10,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#fff',
    width: '50%',
    marginTop: 30,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});
