import {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Buffer} from 'buffer';
import FastImage from 'react-native-fast-image';

import {useMyStore} from '../../store';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {groupItemsType} from '../config/types';
import MyButton from './MyButton';
import {Option} from './Option';

interface Props {
  options: boolean;
  item: groupItemsType;
  onPress?: Function;
  onLongPress?: Function;
  edit: Function;
  pushItem: Function;
  pullItem: Function;
  purchase: boolean;
  checkAll: boolean;
}

export default function ItemO({
  options,
  item,
  onPress = () => null,
  onLongPress = () => null,
  edit,
  pushItem,
  pullItem,
  purchase,
  checkAll,
}: Props) {
  const [checked, setChecked] = useState(false);
  const {userId, members} = useMyStore();

  const userColor = members.find(member => member.userId === item.userId)
    ?.color;
  const url = item.image
    ? item.image
    : `data:image/jpeg;base64,${Buffer.from('').toString('base64')}`;

  useEffect(() => {
    !options && !purchase && setChecked(false);
    options && userId !== item.userId && setChecked(false);
  }, [options, purchase]);

  useEffect(() => {
    checked ? pushItem() : pullItem();
  }, [checked]);

  useEffect(() => {
    checkAll && (userId === item.userId || purchase)
      ? setChecked(true)
      : setChecked(false);
  }, [checkAll]);

  return (
    <Option
      containerStyle2={[styles.itemContainer2, {borderLeftColor: userColor}]}
      containerStyle={styles.itemContainer}
      onPress={() => {
        !options && !purchase && onPress();
        options && userId === item.userId && setChecked(prev => !prev);
        purchase && setChecked(prev => !prev);
      }}
      onLongPress={() => {
        if (!purchase && !options) {
          setChecked(true);
          onLongPress();
        }
      }}>
      {((options && userId === item.userId) || purchase) && (
        <Image
          style={{tintColor: undefined, width: 24, height: 24}}
          source={
            options && checked
              ? require('../assets/checkboxDeleteIcon.png')
              : purchase && checked
              ? require('../assets/checkboxCheckedIcon.png')
              : require('../assets/checkboxIcon.png')
          }
        />
      )}
      <Text
        style={[
          globalStyles.text,
          styles.text,
          {
            left: purchase || (userId === item.userId && options) ? 13 : 0,
            marginRight: options || purchase ? 90 : 114,
          },
        ]}>
        {item.name}
      </Text>
      {item.image && (
        <FastImage
          style={{width: 95, height: 95, right: 41}}
          source={{uri: url}}
        />
      )}
      {options && userId === item.userId && (
        <MyButton
          dimensions={18}
          source={require('../assets/editIcon.png')}
          color={colors.primary}
          containerStyle={{right: 7}}
          onPress={edit}
        />
      )}
      {item.purchased && !options && (
        <View style={styles.itemIconContainer}>
          <Image
            style={styles.itemIcon}
            source={require('../assets/checkIcon.png')}
          />
        </View>
      )}
    </Option>
  );
}

const styles = StyleSheet.create({
  itemContainer: {borderRadius: 15, marginBottom: 6},
  itemContainer2: {borderRadius: 15, borderLeftWidth: 1},
  text: {fontSize: 18, flex: 1},
  itemIcon: {width: 25, height: 25},
  itemIconContainer: {position: 'absolute', width: 25, right: 14},
});
