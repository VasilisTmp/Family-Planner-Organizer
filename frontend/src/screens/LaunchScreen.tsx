import {StyleSheet, Text} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import IdTokenVerifier from 'idtoken-verifier';
import {useEffect, useState, useRef} from 'react';
import jwtDecode from 'jwt-decode';
import Auth0 from 'react-native-auth0';
import messaging from '@react-native-firebase/messaging';

import {AUTH0_CLIENTID, AUTH0_DOMAIN} from '@env';
import colors from '../config/colors';
import {Background, RippleB} from '../components';
import {LaunchScreenProps} from '../navigation/LaunchStack';
import {useMyStore} from '../../store';
import {groupMembersType} from '../config/types';
import {_getGroup, _loadMessagesGroup} from '../api/Groups';
import {_getGroupsUser} from '../api/Users';
import socket from '../utils/socket';
import {API_URL} from '../api/config';

export default function LaunchScreen({navigation}: LaunchScreenProps) {
  const [verified, setVerified] = useState(true);
  const [serverActive, setServerActive] = useState(true);
  const {
    userId,
    setUserId,
    setUsername,
    setBirthdate,
    setGroupId,
    toggleLoading,
    setMembers,
    setItems,
    logIn,
    setGroupAdminId,
    setMeals,
    setAlbums,
    setPhotos,
    setReset,
    setNotes,
    setGroupName,
    setEvents,
    setGroups,
    setMessages,
    setChatIndex,
    setEmail,
    setAllMessages,
  } = useMyStore();

  const auth0 = new Auth0({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENTID,
  });

  const clearSession = async () => {
    const refreshToken = (await EncryptedStorage.getItem('refreshToken')) || '';
    auth0.auth.revoke({refreshToken: refreshToken});
    await EncryptedStorage.clear();
  };

  useEffect(() => {
    (async () => {
      const tokenExists = await EncryptedStorage.getItem('idToken');
      !tokenExists && setVerified(false);
    })();
  }, [userId]);

  const prevActive = useRef(true);

  const check = async (first: boolean) => {
    // clearSession(); /////////////////////////////////////////////////////
    first && toggleLoading(true);
    const res = await fetch(`${API_URL}/ping`);
    if (!res.ok) {
      setServerActive(false);
      prevActive.current = false;
      first && toggleLoading(false);
      navigation.navigate('LaunchScreen');
      return;
    }
    if (!first && serverActive) return;
    console.log(`first:${first}`, `serverActive:${serverActive}`);
    !first && toggleLoading(false);
    setServerActive(true);
    let aight = false;
    let decoded: any;
    let groupId = '';
    const tokenExists = await EncryptedStorage.getItem('idToken');
    if (tokenExists) {
      !serverActive && toggleLoading(true);
      groupId = (await EncryptedStorage.getItem('groupId')) || '';
      const idToken = (await EncryptedStorage.getItem('idToken')) || '';
      const refreshToken =
        (await EncryptedStorage.getItem('refreshToken')) || '';
      decoded = jwtDecode(idToken);
      const verifier = new IdTokenVerifier({
        issuer: `https://${AUTH0_DOMAIN}/`,
        audience: AUTH0_CLIENTID,
      });
      const refresfT = async () => {
        const res = await auth0.auth.refreshToken({
          refreshToken: refreshToken,
          scope: 'openid profile email',
        });
        const idToken2 = res.idToken || '';
        const accessToken2 = res.accessToken;
        const refreshToken2 = res.refreshToken || '';
        await EncryptedStorage.setItem('accessToken', accessToken2);
        await EncryptedStorage.setItem('idToken', idToken2);
        await EncryptedStorage.setItem('refreshToken', refreshToken2);
        aight = true;
        decoded = jwtDecode(idToken2);
      };
      const ver = () => {
        return new Promise(resolve => {
          verifier.verify(idToken, async (error, payload) => {
            if (error) {
              console.log('error1', error);
              try {
                await refresfT();
                resolve(2);
              } catch (error) {
                console.log('error2', error);
                setVerified(false);
                resolve(3);
              }
            } else {
              try {
                await refresfT();
                resolve(0);
              } catch (error) {
                console.log('error3', error);
                setVerified(false);
                resolve(1);
              }
            }
          });
        });
      };
      await ver();
      if (aight) {
        const userId = decoded.sub.split('|')[1];
        setUserId(userId);
        setUsername(decoded.nickname);
        setBirthdate(decoded.birthdate);
        setEmail(decoded.name);
        socket.emit('joinPrivate', userId);
        await messaging().subscribeToTopic(userId);
        const getGroupsUser = await _getGroupsUser(userId);
        setGroups(getGroupsUser);
        if (groupId) {
          await messaging().subscribeToTopic(groupId);
          setGroupId(groupId);
          const group = await _getGroup(groupId);
          setEvents([]);
          setEvents(group.events);
          setGroupName(group.name);
          setGroupAdminId(group.adminId);
          setMembers([]);
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
          setItems([]);
          setItems(group.items);
          setMeals([]);
          setMeals(group.meals);
          setAlbums([]);
          setAlbums(group.albums);
          setPhotos([]);
          setPhotos(group.photos);
          setNotes([]);
          setNotes(group.notes);
          const {msgs, all} = await _loadMessagesGroup(groupId, 0);
          setMessages([]);
          setMessages(msgs);
          setAllMessages(all);
          setChatIndex(-msgs.length);
          logIn();
          setReset();
        } else {
          toggleLoading(false);
          navigation.navigate('GroupScreen');
        }
      } else {
        toggleLoading(false);
      }
    } else {
      toggleLoading(false);
      setVerified(false);
    }
  };

  useEffect(() => {
    prevActive.current &&
      (async () => {
        await check(true);
      })();
    const checkCon = setInterval(async () => {
      await check(false);
    }, 5000);
    return () => clearInterval(checkCon);
  }, [serverActive]);
  //////////////////////////////////////////////////////////////////////////
  return (
    <Background style={styles.container}>
      {serverActive ? (
        <>
          {!verified && (
            <>
              <RippleB
                color={colors.tertiary}
                rippleColor={colors.ripple2}
                style2={styles.LaunchBs2}
                textStyle={styles.textB}
                text="Sign in"
                onPress={() => navigation.navigate('SignInScreen')}
              />
              <RippleB
                color={colors.details}
                rippleColor={colors.ripple2}
                style={styles.signUpB}
                style2={styles.LaunchBs2}
                textStyle={styles.textB}
                onPress={() => navigation.navigate('SignUpScreen')}
                text="Sign up"
              />
            </>
          )}
        </>
      ) : (
        <Text style={styles.serverError}>Server is not available</Text>
      )}
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {justifyContent: 'center', alignItems: 'center'},
  LaunchBs2: {width: 300, paddingVertical: 20},
  signUpB: {marginTop: 20},
  textB: {fontSize: 20, fontWeight: '500'},
  serverError: {color: colors.warning, fontSize: 16},
});
