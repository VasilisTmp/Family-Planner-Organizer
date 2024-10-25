import {Image, Modal, StyleSheet, Text, TextInput, View} from 'react-native';
import {useEffect, useState} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ImagePicker from 'react-native-image-crop-picker';
import SelectDropdown from 'react-native-select-dropdown';
import {useToast} from 'react-native-toast-notifications';
import imgbbUpload from 'imgbb-image-uploader';

import globalStyles from '../config/globalStyles';
import {Background} from './Background';
import colors from '../config/colors';
import {groupMealsType, mealTypes} from '../config/types';
import {weekDays} from '../config/fake data';
import RippleB from './RippleB';
import {_addMealGroup, _updateMealGroup} from '../api/Groups';
import {useMyStore} from '../../store';
import socket from '../utils/socket';
import {IMGBB_API} from '@env';

interface Props {
  visible: boolean;
  close: Function;
  meal: groupMealsType;
  day: string;
}

export default function MealModal({visible, close, meal, day}: Props) {
  const toast = useToast();
  const days = [...weekDays];
  const lastDay = days[0];
  days.splice(0, 1);
  days.splice(6, 0, lastDay);
  const handleChange = (key: string, value: any) =>
    setMealState(prev => ({...prev, [key]: value}));

  const [mealState, setMealState] = useState({
    name: meal.name,
    type: meal.type,
    day: meal.day,
  });

  const [originalImageExists, setOriginalImageExists] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [image, setImage] = useState('');
  const [base64image, setBase64image] = useState('');
  const [base64meal, setBase64meal] = useState('');
  const [originalImageDisplay, setOriginalImageDisplay] = useState(false);
  const {groupId, userId, meals, toggleLoading} = useMyStore();

  useEffect(() => {
    mealState.name && mealState.type ? setDisabled(false) : setDisabled(true);
  }, [mealState]);

  useEffect(() => {
    if (visible) {
      setMealState({
        name: meal.name,
        type: meal.type,
        day: meal.day,
      });
      if (meal.image) {
        setOriginalImageExists(true);
        setOriginalImageDisplay(true);
        setBase64meal(meal.image);
      } else {
        setOriginalImageExists(false);
        setOriginalImageDisplay(false);
        setBase64meal('');
      }
      setImage('');
    }
  }, [visible]);

  useEffect(() => setBase64image(`data:image/jpeg;base64,${image}`), [image]);

  async function addMealGroup() {
    if (!mealState.day) {
      mealState.day = day;
    }
    if (
      meals.some(meal => {
        const {_id, userId, image, ...m} = meal;
        return JSON.stringify(m) === JSON.stringify(mealState);
      })
    ) {
      toast.hideAll();
      toast.show('This meal already exists.', {type: 'warning'});
    } else {
      toggleLoading(true);
      let img = '';
      if (image) {
        const res: any = await imgbbUpload({key: IMGBB_API, image: image})
          .then(data => data)
          .catch(error =>
            console.error('Failed to upload image to ImgBB:', error),
          );
        img = res.data.url;
      }
      const newMeal = await _addMealGroup(
        groupId,
        userId,
        mealState.name,
        mealState.type,
        mealState.day,
        img,
      );
      socket.emit('newmeal', {meal: newMeal, groupId});
      toggleLoading(false);
    }
  }

  async function updateMealGroup() {
    if (
      (meal.day !== mealState.day ||
        meal.name !== mealState.name ||
        meal.type !== mealState.type) &&
      meals.some(meal => {
        const {_id, userId, image, ...m} = meal;
        return JSON.stringify(m) === JSON.stringify(mealState);
      })
    ) {
      toast.hideAll();
      toast.show('This meal already exists.', {type: 'warning'});
    } else {
      if (
        meal.day === mealState.day &&
        meal.name === mealState.name &&
        meal.type === mealState.type &&
        ((originalImageExists && originalImageDisplay) ||
          (!originalImageExists && !originalImageDisplay && !image))
      )
        return;
      toggleLoading(true);
      let img = '';
      if (image) {
        const res: any = await imgbbUpload({key: IMGBB_API, image: image})
          .then(data => data)
          .catch(error =>
            console.error('Failed to upload image to ImgBB:', error),
          );
        img = res.data.url;
      }
      const updatedMeal = await _updateMealGroup(
        groupId,
        meal._id,
        mealState.name,
        mealState.type,
        mealState.day,
        img,
        !originalImageDisplay,
      );
      socket.emit('updatemeal', {meal: updatedMeal, groupId});
      toggleLoading(false);
    }
  }
  ////////////////////////////////////////////////////////////////////////////////
  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={() => close()}>
      <Background style={{paddingTop: 15, paddingHorizontal: 15}}>
        <Text style={[globalStyles.text, {fontSize: 17.5, marginBottom: 10}]}>
          Meal
        </Text>
        <TextInput
          autoCorrect={false}
          defaultValue={mealState.name}
          onChangeText={text => handleChange('name', text.trim())}
          style={[globalStyles.text, styles.titleInput]}
        />
        <SelectDropdown
          onChangeSearchInputText={() => {}}
          defaultValue={meal.type}
          buttonStyle={styles.dropdownB1}
          buttonTextStyle={styles.dropdownBtext}
          renderDropdownIcon={isOpened => {
            return (
              <FontAwesome
                name={isOpened ? 'chevron-up' : 'chevron-down'}
                color={colors.text}
                size={16}
                style={{right: -2}}
              />
            );
          }}
          dropdownStyle={{borderRadius: 20}}
          dropdownIconPosition={'right'}
          rowTextStyle={{fontSize: 18, textAlign: 'left', left: 7}}
          selectedRowStyle={{backgroundColor: colors.ripple}}
          defaultButtonText={meal.type || 'Select type'}
          buttonTextAfterSelection={() => mealState.type}
          data={mealTypes}
          onSelect={(selectedItem, index) => handleChange('type', selectedItem)}
          rowTextForSelection={(item, index) => item}
        />
        <SelectDropdown
          onChangeSearchInputText={() => {}}
          defaultValue={day}
          buttonStyle={styles.dropdownB2}
          buttonTextStyle={styles.dropdownBtext}
          dropdownStyle={{height: 350, borderRadius: 20}}
          renderDropdownIcon={isOpened => {
            return (
              <FontAwesome
                name={isOpened ? 'chevron-up' : 'chevron-down'}
                color={colors.text}
                size={16}
                style={{right: -2}}
              />
            );
          }}
          dropdownIconPosition={'right'}
          rowTextStyle={{fontSize: 18, textAlign: 'left', left: 7}}
          selectedRowStyle={{backgroundColor: colors.ripple}}
          buttonTextAfterSelection={() => mealState.day || day}
          data={days}
          onSelect={(selectedItem, index) => handleChange('day', selectedItem)}
          rowTextForSelection={(item, index) => item}
        />
        <View style={styles.imageOptionsCon}>
          <RippleB
            style={{width: '31.5%'}}
            style2={{height: 44.5}}
            text=""
            onPress={() =>
              ImagePicker.openPicker({
                width: 150,
                height: 150,
                cropping: true,
                includeBase64: true,
                mediaType: 'photo',
                showCropGuidelines: false,
                enableRotationGesture: true,
              })
                .then(image => {
                  setOriginalImageDisplay(false);
                  setImage(image.data || '');
                })
                .catch(err => console.log(err))
            }>
            <Image
              style={{width: 22, height: 22}}
              source={require('../assets/imageIcon.png')}
            />
          </RippleB>
          <RippleB
            style={{width: '31.5%'}}
            style2={{height: 44.5}}
            text=""
            onPress={() =>
              ImagePicker.openCamera({
                width: 150,
                height: 150,
                cropping: true,
                includeBase64: true,
                mediaType: 'photo',
                showCropGuidelines: false,
                enableRotationGesture: true,
              })
                .then(image => {
                  setOriginalImageDisplay(false);
                  setImage(image.data || '');
                })
                .catch(err => console.log(err))
            }>
            <Image
              style={{width: 22, height: 22}}
              source={require('../assets/cameraIcon.png')}
            />
          </RippleB>
          <RippleB
            text="Revert"
            style={{width: '31.5%'}}
            style2={{
              opacity: originalImageExists && !originalImageDisplay ? 1 : 0.4,
            }}
            disabled={
              originalImageExists && !originalImageDisplay ? false : true
            }
            onPress={() => {
              setImage('');
              setOriginalImageDisplay(true);
            }}
          />
        </View>
        {(image || originalImageDisplay) && (
          <View style={styles.imageCon}>
            <Image
              style={{width: 160, height: 160}}
              source={{uri: image ? base64image : base64meal}}
            />
            <RippleB
              text="Clear"
              style2={{width: 115, marginLeft: 50}}
              onPress={() => {
                setImage('');
                setOriginalImageDisplay(false);
              }}
            />
          </View>
        )}
        <View style={styles.finalBsCon}>
          <RippleB
            disabled={disabled}
            color={colors.details}
            rippleColor={colors.ripple2}
            textStyle={styles.finalBtext}
            text={meal._id ? 'Update' : 'Add'}
            style2={[styles.finalBcon2, {opacity: disabled ? 0.5 : 1}]}
            onPress={async () => {
              meal._id ? await updateMealGroup() : await addMealGroup();
              close();
            }}
          />
          <RippleB
            color={colors.tertiary}
            rippleColor={colors.ripple2}
            textStyle={styles.finalBtext}
            text="Cancel"
            style2={styles.finalBcon2}
            onPress={close}
          />
        </View>
      </Background>
    </Modal>
  );
}

const styles = StyleSheet.create({
  titleInput: {
    fontSize: 18,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: colors.text,
    marginBottom: 30,
  },
  dropdownBtext: {left: 3, fontSize: 18, color: colors.text, textAlign: 'left'},
  finalBcon2: {width: 150, paddingVertical: 15},
  finalBtext: {fontWeight: '500'},
  finalBsCon: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    left: 0,
    right: 0,
    top: 596.5,
    position: 'absolute',
  },
  imageCon: {flexDirection: 'row', alignItems: 'center', marginTop: 15},
  imageOptionsCon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  dropdownB1: {
    borderWidth: 1,
    borderColor: colors.text,
    width: 143.8,
    backgroundColor: colors.background,
    marginBottom: 30,
    borderRadius: 25,
  },
  dropdownB2: {
    borderWidth: 1,
    borderColor: colors.text,
    width: 143.8,
    backgroundColor: colors.background,
    borderRadius: 25,
    marginBottom: 34,
  },
});
