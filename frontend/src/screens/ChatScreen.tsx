import {
  StyleSheet,
  TextInput,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Text,
  Keyboard,
  Dimensions,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {useEffect, useMemo, useRef, useState} from 'react';
import notifee from '@notifee/react-native';

import socket from '../utils/socket';
import {Background, MyButton, Message, GhostBackHandler} from '../components';
import globalStyles from '../config/globalStyles';
import colors from '../config/colors';
import {useMyStore} from '../../store';
import {
  _delMsgsGroup,
  _diavastikeGroup,
  _loadMessagesGroup,
  _newMessageGroup,
} from '../api/Groups';
import {groupMessagesType} from '../config/types';

export default function ChatScreen({navigation}: any) {
  const {
    messages,
    userId,
    groupId,
    setMessages,
    chatIndex,
    setChatIndex,
    members,
    reset,
    setUnread,
    setChatFocused,
    msgReceived,
    setMsgReceived,
    allMessages,
    setAllMessages,
    toggleLoading,
  } = useMyStore();
  const [contentHeight, setContentHeight] = useState(0);
  const [prevContentHeight, setPrevContentHeight] = useState(0);
  const [scrollDown, setScrollDown] = useState(false);
  const [scrolledToLast, setScrolledToLast] = useState(true);
  const [text, setText] = useState('');
  const [newIncoming, setNewIncoming] = useState(false);

  const {height} = Dimensions.get('window');
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const messagesLength = useRef(0);
  const newMsg = useRef(false);
  const focused = useIsFocused();
  const loading = useRef(false);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd();
  }, [reset]);

  useEffect(() => {
    if (msgReceived) {
      newMsg.current = true;
      const lastMsg = messages[messages.length - 1];
      setAllMessages(allMessages + 1);
      setChatIndex(chatIndex - 1);
      setMsgReceived(false);
      if (userId === lastMsg.userId) {
        scrollViewRef.current?.scrollToEnd();
      } else {
        setNewIncoming(true);
        !scrollDown && scrollViewRef.current?.scrollToEnd();
      }
    }
  }, [msgReceived]);

  const Diavastike = async () => {
    const memberRead = members.find(m => m.userId === userId);
    const temp = [...messages];
    let noNeed = false;
    let newRead = {} as groupMessagesType;
    temp.reverse();
    temp[0].userId === userId ? (noNeed = true) : (newRead = {...temp[0]});
    if (
      !noNeed &&
      memberRead &&
      newRead &&
      newRead._id !== memberRead.lastRead
    ) {
      await _diavastikeGroup(groupId, userId, newRead._id);
      socket.emit('diavastike', {
        member: userId,
        groupId,
      });
      await notifee.cancelDisplayedNotifications();
    }
    setUnread(0);
  };

  useEffect(() => {
    const memberRead = members.find(m => m.userId === userId);
    let countUnread = 0;
    if (memberRead) {
      const temp = [...messages];
      temp.reverse();
      const lastRead = memberRead.lastRead;
      for (let i = 0; i < messages.length; i++) {
        if (temp[i].userId === userId) break;
        if (temp[i]._id === lastRead) break;
        if (temp[i].userId !== userId) countUnread++;
      }
      setUnread(countUnread);
    }
  }, [messages]);

  useEffect(() => {
    if (scrolledToLast && focused && newIncoming) {
      setNewIncoming(false);
      Diavastike();
    }
  }, [scrolledToLast, newIncoming]);

  useEffect(() => {
    setChatFocused(focused);
    if (focused && messages.length && scrolledToLast) {
      setNewIncoming(false);
      Diavastike();
    }
  }, [focused]);

  const messagesList = useMemo(() => {
    let ret = [] as JSX.Element[];
    for (let i = 0; i < messages.length; i++) {
      ret.push(
        <Message
          message={messages[i]}
          nextMe={
            i + 1 !== messages.length && messages[i + 1].userId === userId
          }
          prevDiff={
            messages[i].userId !== userId &&
            (!i || messages[i].userId !== messages[i - 1].userId)
          }
          nextDiff={
            i + 1 === messages.length ||
            messages[i].userId !== messages[i + 1].userId
          }
          key={messages[i]._id}
        />,
      );
    }
    return ret;
  }, [messages]);

  async function loadMessagesGroup() {
    if (focused && !loading.current) {
      if (messages.length === allMessages) return;
      loading.current = true;
      toggleLoading(true);
      const {msgs} = await _loadMessagesGroup(groupId, chatIndex);
      const moreMessages = Array.from(
        new Set([...msgs, ...messages].map(m => JSON.stringify(m))),
      ).map(m => JSON.parse(m));
      setChatIndex(-moreMessages.length);
      setMessages([...moreMessages]);
    }
  }

  async function sendMessage() {
    const msg = text;
    setText('');
    const newMessage = await _newMessageGroup(groupId, userId, msg, new Date());
    await _diavastikeGroup(groupId, userId, newMessage._id);
    const nickname = members.find(m => m.userId === userId)?.nickname || '';
    socket.emit('newmessage', {newMessage, groupId, nickname});
  }

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {},
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        focused && textInputRef.current?.blur();
      },
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [focused]);

  useEffect(() => {
    if (newMsg.current) {
      newMsg.current = false;
      messagesLength.current = messages.length;
    } else if (messages.length !== messagesLength.current && loading.current) {
      messagesLength.current = messages.length;
      focused &&
        scrollViewRef.current?.scrollTo({
          y: contentHeight - prevContentHeight - height / 2,
          animated: true,
        });
      toggleLoading(false);
      loading.current = false;
    }
  }, [contentHeight]);

  //////////////////////////////////////////////////////////////////////////////
  return (
    <Background style={{paddingTop: 10}}>
      {focused && <GhostBackHandler action={navigation.goBack} />}
      <ScrollView
        onScroll={e => {
          const nE = e.nativeEvent;
          nE.contentOffset.y === 0 && loadMessagesGroup();
          nE.contentSize.height - nE.contentOffset.y >
          nE.layoutMeasurement.height + 50
            ? setScrolledToLast(false)
            : setScrolledToLast(true);
          nE.contentSize.height - nE.contentOffset.y >
          nE.layoutMeasurement.height * 1.5
            ? setScrollDown(true)
            : setScrollDown(false);
        }}
        onContentSizeChange={(w, h) => {
          setPrevContentHeight(contentHeight);
          setContentHeight(h);
        }}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        nestedScrollEnabled
        contentContainerStyle={{justifyContent: 'flex-end', flexGrow: 1}}>
        <TouchableWithoutFeedback onPress={textInputRef.current?.blur}>
          <View style={{paddingBottom: 8}}>{messagesList}</View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <View style={{paddingVertical: 5}}>
        <TextInput
          defaultValue={text}
          placeholder="Aa"
          placeholderTextColor={colors.ripple}
          ref={textInputRef}
          style={[styles.input, globalStyles.text]}
          onFocus={() => !scrollDown && scrollViewRef.current?.scrollToEnd()}
          onBlur={() => !scrollDown && scrollViewRef.current?.scrollToEnd()}
          onChangeText={e => {
            !scrollDown && scrollViewRef.current?.scrollToEnd();
            setText(e.trim());
          }}
          multiline
          autoFocus
        />
      </View>
      <MyButton
        color={colors.background}
        source={require('../assets/sendIcon.png')}
        dimensions={18}
        containerStyle={{right: 0, bottom: 6, padding: 14}}
        onPress={() => text && sendMessage()}
        iconStyle={{left: 2}}
      />
      {scrollDown && newIncoming && (
        <Text style={[globalStyles.text, styles.newMessages]}>
          You have new messages
        </Text>
      )}
      {scrollDown && (
        <MyButton
          activeColor={colors.ripple}
          dimensions={25}
          source={require('../assets/downArrowIcon.png')}
          containerStyle={styles.scrollDownB}
          onPress={() => scrollViewRef.current?.scrollToEnd()}
        />
      )}

      {/* <MyButton
        dimensions={18}
        source={require('../assets/searchIcon.png')}
        containerStyle={{left: 5, bottom: 10}}
        onPress={async () => await _delMsgsGroup(groupId)}
      /> */}
    </Background>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 25,
    fontSize: 18,
    paddingHorizontal: 13,
    backgroundColor: colors.tertiary,
    marginRight: 47,
    marginLeft: 13,
    maxHeight: 127,
  },
  scrollDownB: {
    alignSelf: 'center',
    bottom: 65,
    borderWidth: 1,
    borderColor: colors.tertiary,
  },
  newMessages: {
    fontWeight: '300',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 117,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.tertiary,
    paddingRight: 8,
    paddingLeft: 10,
  },
});
