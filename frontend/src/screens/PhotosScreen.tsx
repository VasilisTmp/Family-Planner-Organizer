import {useEffect, useRef, useState} from 'react';
import {
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import SelectDropdown from 'react-native-select-dropdown';
import {useToast} from 'react-native-toast-notifications';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useIsFocused} from '@react-navigation/native';
import {imgbbUpload} from 'imgbb-image-uploader';

import {IMGBB_API} from '@env';
import {useMyStore} from '../../store';
import {
  _addAlbumGroup,
  _addPhotosGroup,
  _deleteAlbumGroup,
  _deletePhotosGroup,
  _getPhotosGroup,
  _movePhotosGroup,
  _updateAlbumNameGroup,
} from '../api/Groups';
import {
  Background,
  ConfirmModal,
  GhostBackHandler,
  PhotoO,
  InputModal,
  MyButton,
  OptionsBar,
  PhotoModal,
  PhotoModal2,
  GhostPhotoO,
  BottomOptionsBar,
} from '../components';
import colors from '../config/colors';
import socket from '../utils/socket';

let photosSelected = [] as string[];

export default function PhotosScreen({navigation}: any) {
  const {groupId, userId, albums, photos, reset, toggleLoading} = useMyStore();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [photoModal, setPhotoModal] = useState(false);
  const [photoModal2, setPhotoModal2] = useState(false);
  const [album, setAlbum] = useState(
    albums.find(a => a.name === 'Any')?._id || '',
  );
  const [photoOptions, setPhotoOptions] = useState(false);
  const [inputModal, setInputModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [update, setUpdate] = useState(false);
  const [optionsBar, setOptionsBar] = useState(true);
  const [moveTo, setMoveTo] = useState('');
  const [checkAll, setCheckAll] = useState(false);

  const {width} = Dimensions.get('window');
  const toast = useToast();
  const albumUserId = albums.find(a => a._id === album)?.userId;
  const pushPhotosSelected = (id: string) => photosSelected.push(id);
  const pullPhotosSelected = (id: string) =>
    (photosSelected = photosSelected.filter(p => p !== id));
  const putPhotosSelected = (id: string[]) => (photosSelected = id);
  const focused = useIsFocused();
  const albumName = useRef('');
  const setAlbumName = (to: string) => (albumName.current = to);

  useEffect(() => {
    !photoOptions && setCheckAll(false);
  }, [photoOptions]);

  useEffect(() => {
    !albums.find(a => a._id === album) &&
      setAlbum(albums.find(a => a.name === 'Any')?._id || '');
  }, [albums]);

  useEffect(() => {
    setPhotoOptions(false);
    setAlbum(albums.find(a => a.name === 'Any')?._id || '');
  }, [reset]);

  const imagesURL = photos.map(p => {
    return {image: p.image, id: p._id};
  });

  async function addPhotosGroup(images: string[]) {
    toggleLoading(true);
    const uploadPromises = images.map(i =>
      imgbbUpload({key: IMGBB_API, image: i})
        .then(data => data)
        .catch(error =>
          console.error('Failed to upload image to ImgBB:', error),
        ),
    );
    const responses = await Promise.all(uploadPromises);
    const urls = responses.map((r: any) => r.data.url);
    const albumN = albums.find(a => a._id === album)?.name || '';
    const newPhotos = await _addPhotosGroup(groupId, userId, urls, albumN);
    socket.emit('newphotos', {photos: newPhotos, groupId});
    toggleLoading(false);
  }

  async function deletePhotosGroup() {
    toggleLoading(true);
    await _deletePhotosGroup(groupId, photosSelected);
    const selected = [...photosSelected];
    socket.emit('deletephotos', {selected: selected, groupId});
    setPhotoOptions(false);
    toggleLoading(false);
  }

  async function updateAlbumNameGroup() {
    const albumN = albums.find(a => a._id === album)?.name || '';
    if (albumN !== albumName.current) {
      if (albums.some(a => a.name === albumName.current)) {
        toast.hideAll();
        toast.show('This album already exists.', {type: 'warning'});
      } else {
        toggleLoading(true);
        await _updateAlbumNameGroup(groupId, album, albumName.current, albumN);
        const updateAlbum = albums.find(a => a._id === album);
        if (updateAlbum) {
          updateAlbum.name = albumName.current;
          socket.emit('renamealbum', {
            album: albumN,
            value: albumName.current,
            groupId,
          });
        }
        toggleLoading(false);
      }
    }
  }

  async function addAlbumGroup() {
    if (albums.some(a => a.name === albumName.current)) {
      toast.hideAll();
      toast.show('This album already exists.', {type: 'warning'});
    } else {
      toggleLoading(true);
      const newAlbum = await _addAlbumGroup(groupId, userId, albumName.current);
      socket.emit('newalbum', {album: newAlbum, groupId});
      toggleLoading(false);
    }
  }

  async function deleteAlbumGroup() {
    toggleLoading(true);
    const albumN = albums.find(a => a._id === album)?.name || '';
    await _deleteAlbumGroup(groupId, album, albumN);
    socket.emit('deletealbum', {album: albumN, groupId});
    setAlbum(albums.find(a => a.name === 'Any')?._id || '');
    toggleLoading(false);
  }

  async function movePhotosGroup() {
    toggleLoading(true);
    await _movePhotosGroup(groupId, photosSelected, moveTo);
    const selected = [...photosSelected];
    socket.emit('movephotos', {
      selected: selected,
      album: moveTo,
      groupId,
    });
    setPhotoModal2(false);
    setPhotoOptions(false);
    toggleLoading(false);
  }

  const photosList = (() => {
    const albumN = albums.find(a => a._id === album)?.name || '';
    const phts = photos.filter(p => p.album === albumN);
    return phts.map(p => {
      const url = imagesURL.find(i => i.id === p._id)?.image || '';
      return (
        <PhotoO
          checkAll={checkAll}
          imageURL={url}
          onPress={() => {
            const index = phts.findIndex(photo => photo._id === p._id);
            setCarouselIndex(index);
            setPhotoModal(true);
            setOptionsBar(true);
          }}
          photo={p}
          key={p._id}
          options={photoOptions}
          onLongPress={() => setPhotoOptions(true)}
          pullImage={() => pullPhotosSelected(p._id)}
          pushImage={() => pushPhotosSelected(p._id)}
        />
      );
    });
  })();

  const photosIds = (() => {
    const albumN = albums.find(a => a._id === album)?.name || '';
    return photos.filter(p => p.album === albumN).map(p => p._id);
  })();

  const photosCarousel = photosIds.map(p => {
    const url = imagesURL.find(i => i.id === p)?.image || '';
    return (
      <TouchableWithoutFeedback
        key={p}
        onPress={() => setOptionsBar(prev => !prev)}>
        <Image
          style={{flex: 1, resizeMode: 'contain', width: width}}
          source={{uri: url}}
        />
      </TouchableWithoutFeedback>
    );
  });

  /////////////////////////////////////////////////////////////////////////////
  return (
    <Background>
      {focused && !photoOptions && (
        <GhostBackHandler action={navigation.goBack} />
        // <GhostBackHandler action={() => console.log(photosSelected)} />
      )}
      {focused && photoOptions && (
        <GhostBackHandler action={() => setPhotoOptions(false)} />
        // <GhostBackHandler action={() => console.log(photosSelected)} />
      )}
      <GhostBackHandler action={navigation.goBack} />
      <PhotoModal2
        moveTo={moveTo}
        setMoveTo={setMoveTo}
        album={album}
        visible={photoModal2}
        close={() => setPhotoModal2(false)}
        openConfirmModal={() => setConfirmModal(true)}
      />
      <PhotoModal
        openPhotoModal2={() => setPhotoModal2(true)}
        putPhotosSelected={putPhotosSelected}
        openConfirmModal={() => setConfirmModal(true)}
        photosIds={photosIds}
        optionsBar={optionsBar}
        visible={photoModal}
        close={() => {
          putPhotosSelected([]);
          setPhotoModal(false);
        }}
        index={carouselIndex}>
        {photosCarousel}
      </PhotoModal>
      <ConfirmModal
        close={() => {
          setConfirmModal(false);
          photoModal2 &&
            setMoveTo(albums.find(a => a._id === album)?.name || '');
        }}
        text={
          photoModal2
            ? `Move to ${moveTo} ?`
            : photoModal
            ? 'Delete photo ?'
            : photoOptions
            ? 'Delete selected photos ?'
            : `Delete ${
                albums.find(a => a._id === album)?.name || ''
              } and its contents ?`
        }
        visible={confirmModal}
        confirm={
          photoModal2
            ? movePhotosGroup
            : photoOptions || photoModal
            ? deletePhotosGroup
            : deleteAlbumGroup
        }
      />
      <InputModal
        text={albumName.current}
        setText={setAlbumName}
        confirm={!update ? addAlbumGroup : updateAlbumNameGroup}
        close={() => setInputModal(false)}
        visible={inputModal}
      />
      <OptionsBar>
        {!photoOptions ? (
          <>
            <SelectDropdown
              disableAutoScroll
              data={albums}
              onChangeSearchInputText={() => {}}
              defaultValue={albums.find(a => a._id === album)}
              buttonStyle={styles.dropdownB}
              buttonTextStyle={styles.dropdownBtext}
              dropdownStyle={{borderRadius: 20}}
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
              rowTextStyle={styles.dropdownOptionText}
              selectedRowStyle={{backgroundColor: colors.ripple}}
              buttonTextAfterSelection={() =>
                albums.find(a => a._id === album)?.name || ''
              }
              onSelect={(selectedItem, index) => setAlbum(selectedItem._id)}
              rowTextForSelection={(item, index) => item.name}
            />
            <MyButton
              containerStyle={styles.editAlbumB}
              source={require('../assets/editIcon.png')}
              onPress={() => {
                const albumN = albums.find(a => a._id === album)?.name || '';
                if (albumN !== 'Any' && albumUserId === userId) {
                  setUpdate(true);
                  const albumN = albums.find(a => a._id === album)?.name || '';
                  setAlbumName(albumN);
                  setInputModal(true);
                }
              }}
            />
            <MyButton
              containerStyle={styles.addAlbumB}
              source={require('../assets/addIcon.png')}
              onPress={() => {
                setUpdate(false);
                setAlbumName('');
                setInputModal(true);
              }}
            />
            <MyButton
              containerStyle={styles.deleteAlbumB}
              source={require('../assets/trashIcon.png')}
              onPress={() => {
                const albumN = albums.find(a => a._id === album)?.name || '';
                if (albumN !== 'Any' && albumUserId === userId) {
                  if (
                    photos
                      .filter(p => p.album === albumN)
                      .some(p => p.userId !== userId)
                  ) {
                    toast.hideAll();
                    toast.show(
                      'This album contains photos of another member.',
                      {
                        type: 'warning',
                      },
                    );
                  } else {
                    setConfirmModal(true);
                  }
                }
              }}
            />
            <MyButton
              containerStyle={styles.addPhotoB}
              dimensions={23}
              source={require('../assets/addImageIcon.png')}
              onPress={() =>
                ImageCropPicker.openPicker({
                  mediaType: 'photo',
                  multiple: true,
                  includeBase64: true,
                })
                  .then(images => {
                    const paths = images.map(image => image.data || '');
                    addPhotosGroup(paths);
                  })
                  .catch(err => console.log(err))
              }
            />
          </>
        ) : (
          <MyButton
            source={require('../assets/backArrowIcon.png')}
            containerStyle={styles.backB}
            onPress={() => setPhotoOptions(false)}
          />
        )}
      </OptionsBar>
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        nestedScrollEnabled>
        <View
          style={[styles.scrollView, {marginBottom: photoOptions ? 53 : 0}]}>
          {photosList}
          {photosList.length % 3 !== 0 && <GhostPhotoO />}
        </View>
      </ScrollView>
      {photoOptions && (
        <BottomOptionsBar>
          <MyButton
            color="transparent"
            source={require('../assets/moveFolderIcon.png')}
            dimensions={23}
            containerStyle={styles.moveB}
            onPress={() => photosSelected.length && setPhotoModal2(true)}
          />
          <MyButton
            color="transparent"
            containerStyle={styles.deleteB}
            source={require('../assets/trashIcon.png')}
            onPress={() => photosSelected.length && setConfirmModal(true)}
          />
          <MyButton
            color="transparent"
            source={require('../assets/checkAllIcon.png')}
            dimensions={24}
            containerStyle={styles.checkAllB}
            onPress={() => setCheckAll(prev => !prev)}
          />
        </BottomOptionsBar>
      )}
    </Background>
  );
}

const styles = StyleSheet.create({
  checkAllB: {position: 'relative'},
  moveB: {position: 'relative'},
  deleteB: {position: 'relative'},
  dropdownBtext: {fontSize: 18, color: colors.text, textAlign: 'left', left: 3},
  addAlbumB: {left: 210},
  editAlbumB: {left: 165},
  deleteAlbumB: {left: 255},
  backB: {left: 5},
  addPhotoB: {right: 5},
  scrollView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dropdownB: {
    borderWidth: 1,
    borderColor: colors.text,
    width: 150,
    backgroundColor: colors.background,
    height: 48,
    borderRadius: 25,
    left: 5,
  },
  dropdownOptionText: {fontSize: 18, textAlign: 'left', paddingHorizontal: 7},
});
