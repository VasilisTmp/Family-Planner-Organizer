import {useEffect, useState} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {useToast} from 'react-native-toast-notifications';

import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import RippleB from './RippleB';
import {groupItemsType} from '../config/types';
import {useMyStore} from '../../store';
import {_addItemGroup, _updateItemGroup} from '../api/Groups';
import socket from '../utils/socket';
import imgbbUpload from 'imgbb-image-uploader';
import {IMGBB_API} from '@env';

interface Props {
  visible: boolean;
  close: Function;
  item: groupItemsType;
  closeOptions: Function;
  openPurchase: Function;
}

export default function ItemModal2({
  visible,
  close,
  item,
  closeOptions,
  openPurchase,
}: Props) {
  const [disabled, setDisabled] = useState(true);
  const [image, setImage] = useState('');
  const [base64image, setBase64image] = useState('');
  const [base64meal, setBase64meal] = useState('');
  const [originalImageDisplay, setOriginalImageDisplay] = useState(false);
  const [itemName, setItemName] = useState(item.name);
  const {groupId, userId, items, toggleLoading} = useMyStore();
  const [originalImageExists, setOriginalImageExists] = useState(false);
  const toast = useToast();

  useEffect(() => {
    itemName ? setDisabled(false) : setDisabled(true);
  }, [itemName]);

  useEffect(() => {
    if (visible) {
      setItemName(item.name);
      if (item.image) {
        setOriginalImageExists(true);
        setOriginalImageDisplay(true);
        setBase64meal(item.image);
      } else {
        setOriginalImageExists(false);
        setOriginalImageDisplay(false);
        setBase64meal('');
      }
      setImage('');
    }
  }, [visible]);

  useEffect(() => setBase64image(`data:image/jpeg;base64,${image}`), [image]);

  async function addItemGroup() {
    if (items.some(i => i.name === itemName)) {
      toast.hideAll();
      toast.show('This item already exists.', {type: 'warning'});
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
      const newitem = await _addItemGroup(groupId, userId, itemName, img);
      socket.emit('newitem', {item: newitem, groupId});
      toggleLoading(false);
    }
  }

  async function updateItemGroup() {
    if (itemName !== item.name && items.some(i => i.name === itemName)) {
      toast.hideAll();
      toast.show('This item already exists.', {type: 'warning'});
    } else {
      if (
        itemName === item.name &&
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
      const updatedItem = await _updateItemGroup(
        groupId,
        item._id,
        itemName,
        img,
        !originalImageDisplay,
      );
      closeOptions();
      openPurchase();
      socket.emit('updateitem', {item: updatedItem, groupId});
      toggleLoading(false);
    }
  }
  /////////////////////////////////////////////////////////////////////
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => close()}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            backgroundColor: `rgba(${colors.backgroundTrans},0.8)`,
          }}>
          <View
            style={{
              position: 'absolute',
              bottom: 30,
              backgroundColor: colors.secondary,
              width: 340,
              borderRadius: 25,
              paddingVertical: 25,
              paddingHorizontal: 15,
            }}>
            <TextInput
              autoCorrect={false}
              defaultValue={itemName}
              onChangeText={text => setItemName(text.trim())}
              style={[globalStyles.text, styles.input]}
            />
            <View style={styles.imageOptionsCon}>
              <RippleB
                style={{width: '31.5%', borderRadius: 25}}
                style2={{height: 44.5, borderRadius: 25}}
                text=""
                onPress={() =>
                  ImagePicker.openPicker({
                    width: 300,
                    height: 300,
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
                style={{width: '31.5%', borderRadius: 25}}
                style2={{height: 44.5, borderRadius: 25}}
                text=""
                onPress={() =>
                  ImagePicker.openCamera({
                    width: 300,
                    height: 300,
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
                style={{width: '31.5%', borderRadius: 25}}
                style2={{
                  borderRadius: 25,
                  opacity:
                    originalImageExists && !originalImageDisplay ? 1 : 0.4,
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
                  style={{width: 120, height: 120}}
                  source={{uri: image ? base64image : base64meal}}
                />
                <RippleB
                  text="Clear"
                  style={{borderRadius: 25}}
                  style2={{width: 105, borderRadius: 25}}
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
                text={item._id ? 'Update' : 'Add'}
                style={[styles.finalBcon, {opacity: disabled ? 0.5 : 1}]}
                style2={styles.finalBcon2}
                onPress={async () => {
                  item._id ? await updateItemGroup() : await addItemGroup();
                  close();
                }}
              />
              <RippleB
                color={colors.tertiary}
                rippleColor={colors.ripple2}
                text="Cancel"
                style={styles.finalBcon}
                style2={styles.finalBcon2}
                onPress={close}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  finalBcon2: {width: 120, borderRadius: 25},
  finalBcon: {borderRadius: 25},
  finalBsCon: {flex: 1, flexDirection: 'row', justifyContent: 'space-around'},
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.ripple,
    paddingHorizontal: 15,
    fontSize: 18,
    borderRadius: 25,
  },
  imageOptionsCon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  imageCon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    justifyContent: 'space-evenly',
  },
});
