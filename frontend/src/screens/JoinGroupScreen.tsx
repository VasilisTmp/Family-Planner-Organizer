import {ScrollView, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import messaging from '@react-native-firebase/messaging';

import {useMyStore} from '../../store';
import {OptionsBar, Option, MyButton, Background} from '../components';
import colors from '../config/colors';
import {_getGroupsUser} from '../api/Users';
import globalStyles from '../config/globalStyles';
import {_getGroup, _getMembersGroup, _loadMessagesGroup} from '../api/Groups';
import {JoinGroupScreenPropsHomeStack} from '../navigation/HomeStack';
import {JoinGroupScreenPropsLaunchStack} from '../navigation/LaunchStack';
import {groupMembersType} from '../config/types';
import {EffectBackHandler} from '../utils';

export default function JoinGroupScreen() {
  const homeStackNavigation = useNavigation<JoinGroupScreenPropsHomeStack>();
  const launchStackNavigation =
    useNavigation<JoinGroupScreenPropsLaunchStack>();

  const {
    setMembers,
    setItems,
    groupId,
    logIn,
    setGroupId,
    setGroupAdminId,
    groups,
    setMeals,
    setAlbums,
    setPhotos,
    setReset,
    toggleLoading,
    setNotes,
    setGroupName,
    loggedIn,
    setEvents,
    setMessages,
    setChatIndex,
    setAllMessages,
    logOut,
  } = useMyStore();

  EffectBackHandler(
    loggedIn ? homeStackNavigation.goBack : launchStackNavigation.goBack,
  );

  const groupList = groups
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(item => {
      return (
        <Option
          textStyle={{width: 280}}
          color={colors.background}
          key={item._id}
          text={item.name}
          onPress={async () => {
            toggleLoading(true);
            logOut();
            await messaging().subscribeToTopic(item._id);
            const group = await _getGroup(item._id);
            groupId && messaging().unsubscribeFromTopic(groupId);
            EncryptedStorage.setItem('groupId', item._id);
            setGroupId(item._id);
            setGroupName(item.name);
            setGroupAdminId(item.adminId);
            setMembers(
              group.members.map((member: groupMembersType) => ({
                userId: member.userId,
                nickname: member.nickname,
                color: member.color,
                originalname: member.originalname,
                birthdate: member.birthdate,
                lastRead: member.lastRead,
              })),
            );
            setEvents(group.events);
            setItems(group.items);
            setMeals(group.meals);
            setAlbums(group.albums);
            setPhotos(group.photos);
            setNotes(group.notes);
            const {msgs, all} = await _loadMessagesGroup(item._id, 0);
            setMessages(msgs);
            setAllMessages(all);
            setChatIndex(-msgs.length);
            logIn();
            setReset();
          }}>
          {item._id === groupId && (
            <Text
              style={[
                globalStyles.text,
                {fontSize: 17, position: 'absolute', right: 15},
              ]}>
              Selected
            </Text>
          )}
        </Option>
      );
    });
  ////////////////////////////////////////////////////////////////////////
  return (
    <Background>
      <OptionsBar>
        <MyButton
          containerStyle={{left: 5}}
          onPress={
            loggedIn ? homeStackNavigation.goBack : launchStackNavigation.goBack
          }
          source={require('../assets/backArrowIcon.png')}
        />
      </OptionsBar>
      <ScrollView showsVerticalScrollIndicator={false} overScrollMode="never">
        {groupList}
      </ScrollView>
    </Background>
  );
}
