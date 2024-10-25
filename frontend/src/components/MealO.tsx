import {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Buffer} from 'buffer';
import FastImage from 'react-native-fast-image';

import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {groupMealsType} from '../config/types';
import MyButton from './MyButton';
import {Option} from './Option';
import {useMyStore} from '../../store';

interface Props {
  options: boolean;
  pushMeal?: Function;
  pullMeal?: Function;
  onLongPress?: Function;
  edit?: Function;
  meal: groupMealsType;
}

export default function MealO({
  options,
  pushMeal = () => null,
  pullMeal = () => null,
  onLongPress = () => null,
  edit = () => null,
  meal,
}: Props) {
  const [checked, setChecked] = useState(false);
  const {userId} = useMyStore();

  const url = meal.image
    ? meal.image
    : `data:image/jpeg;base64,${Buffer.from('').toString('base64')}`;

  useEffect(() => {
    !options && setChecked(false);
  }, [options]);

  useEffect(() => {
    checked ? pushMeal() : pullMeal();
  }, [checked]);

  return (
    <Option
      containerStyle2={styles.mealCon2}
      containerStyle={styles.mealCon}
      onLongPress={() => {
        if (!options) {
          userId === meal.userId && setChecked(true);
          onLongPress();
        }
      }}
      onPress={() =>
        options && userId === meal.userId && setChecked(prev => !prev)
      }>
      <View style={{flex: 1, paddingRight: 20}}>
        <Text style={[globalStyles.text, {fontSize: 14, fontStyle: 'italic'}]}>
          {meal.type}
        </Text>
        <Text style={[globalStyles.text, {fontSize: 18}]}>{meal.name}</Text>
      </View>
      <Image style={{width: 95, height: 95, left: 5}} source={{uri: url}} />
      {options && userId === meal.userId && (
        <FastImage
          style={styles.checkIcon}
          source={
            checked
              ? require('../assets/checkboxDeleteIcon.png')
              : require('../assets/checkboxIcon.png')
          }
        />
      )}
      {options && userId === meal.userId && (
        <MyButton
          dimensions={20}
          source={require('../assets/editIcon.png')}
          color={colors.primary}
          containerStyle={{left: '60%', bottom: 0}}
          onPress={edit}
        />
      )}
    </Option>
  );
}

const styles = StyleSheet.create({
  mealCon2: {borderRadius: 15},
  mealCon: {borderRadius: 15, marginBottom: 6},
  checkIcon: {
    tintColor: undefined,
    width: 24,
    height: 24,
    position: 'absolute',
    left: 5,
    top: 5,
    backgroundColor: colors.primary,
  },
});
