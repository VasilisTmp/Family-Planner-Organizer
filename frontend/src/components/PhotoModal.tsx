import {useEffect, useRef} from 'react';
import {Modal, StyleSheet} from 'react-native';
import {SwiperFlatList} from 'react-native-swiper-flatlist';

import {_deletePhotosGroup} from '../api/Groups';
import colors from '../config/colors';
import {Background} from './Background';
import BottomOptionsBar from './BottomOptionsBar';
import MyButton from './MyButton';
import OptionsBar from './OptionsBar';
import {useMyStore} from '../../store';

interface Props {
  visible: boolean;
  close: Function;
  index: number;
  children?: React.ReactNode;
  optionsBar: boolean;
  photosIds: string[];
  putPhotosSelected: Function;
  openConfirmModal: Function;
  openPhotoModal2: Function;
}

export default function PhotoModal({
  visible,
  close,
  index,
  children,
  optionsBar,
  photosIds,
  putPhotosSelected,
  openConfirmModal,
  openPhotoModal2,
}: Props) {
  const swiperRef = useRef<SwiperFlatList>(null);

  const {userId, photos} = useMyStore();

  useEffect(() => {
    !photosIds.length && close();
    const currIndex = swiperRef.current?.getCurrentIndex() || 0;
    photosIds.length &&
      currIndex > photosIds.length - 1 &&
      swiperRef.current?.goToLastIndex();
  }, [photosIds]);

  return (
    <Modal
      animationType="fade"
      visible={visible}
      onRequestClose={() => close()}>
      <Background>
        <SwiperFlatList ref={swiperRef} index={index}>
          {children}
        </SwiperFlatList>
        {optionsBar && (
          <OptionsBar style={styles.topOptionsBar}>
            <MyButton
              color="transparent"
              source={require('../assets/backArrowIcon.png')}
              containerStyle={styles.backB}
              onPress={close}
            />
          </OptionsBar>
        )}
        {optionsBar && (
          <BottomOptionsBar>
            <MyButton
              color="transparent"
              source={require('../assets/moveFolderIcon.png')}
              dimensions={23}
              containerStyle={styles.moveB}
              onPress={() => {
                putPhotosSelected([
                  photosIds[swiperRef.current?.getCurrentIndex() || 0],
                ]);
                userId ===
                  photos.find(
                    p =>
                      p._id ===
                      photosIds[swiperRef.current?.getCurrentIndex() || 0],
                  )?.userId && openPhotoModal2();
              }}
            />
            <MyButton
              color="transparent"
              containerStyle={styles.deleteB}
              source={require('../assets/trashIcon.png')}
              onPress={() => {
                putPhotosSelected([
                  photosIds[swiperRef.current?.getCurrentIndex() || 0],
                ]);
                userId ===
                  photos.find(
                    p =>
                      p._id ===
                      photosIds[swiperRef.current?.getCurrentIndex() || 0],
                  )?.userId && openConfirmModal();
              }}
            />
          </BottomOptionsBar>
        )}
      </Background>
    </Modal>
  );
}

const styles = StyleSheet.create({
  moveB: {position: 'relative', padding: 9},
  deleteB: {position: 'relative'},
  backB: {left: 5},
  topOptionsBar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: `rgba(${colors.backgroundTrans},0.85)`,
  },
});
