import {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';

import {groupPhotosType} from '../config/types';
import {useMyStore} from '../../store';
import colors from '../config/colors';

interface Props {
  options: boolean;
  onPress?: Function;
  onLongPress?: Function;
  pushImage: Function;
  pullImage: Function;
  photo: groupPhotosType;
  imageURL: string;
  checkAll: boolean;
}

export default function PhotoO({
  options,
  onPress = () => null,
  onLongPress = () => null,
  pushImage,
  pullImage,
  photo,
  imageURL,
  checkAll,
}: Props) {
  const [checked, setChecked] = useState(false);
  const {userId} = useMyStore();

  useEffect(() => {
    !options && setChecked(false);
  }, [options]);

  useEffect(() => {
    checked ? pushImage() : pullImage();
  }, [checked]);

  useEffect(() => {
    checkAll && userId === photo.userId ? setChecked(true) : setChecked(false);
  }, [checkAll]);
  //////////////////////////////////////////////////////////////////////////////
  return (
    <Pressable
      delayLongPress={colors.delay}
      onPress={() =>
        options
          ? userId === photo.userId && setChecked(prev => !prev)
          : onPress()
      }
      onLongPress={() => {
        if (!options) {
          userId === photo.userId && setChecked(true);
          onLongPress();
        }
      }}
      style={{marginVertical: 1, width: '33%'}}>
      <FastImage
        style={{width: '100%', height: 120}}
        source={{uri: imageURL}}
      />
      {options && checked && userId === photo.userId && (
        <View style={styles.overlay} />
      )}
      {options && userId === photo.userId && (
        <Image
          style={styles.checkbox}
          source={
            checked
              ? require('../assets/checkboxCheckedIcon.png')
              : require('../assets/checkboxIcon.png')
          }
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  checkbox: {
    position: 'absolute',
    top: 2,
    left: 2,
    tintColor: undefined,
    width: 24,
    height: 24,
  },
});
