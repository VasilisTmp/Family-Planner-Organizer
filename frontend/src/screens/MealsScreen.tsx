import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {useState, useEffect} from 'react';
import moment from 'moment';
import {useIsFocused} from '@react-navigation/native';

import {
  AddB,
  Background,
  ConfirmModal,
  GhostBackHandler,
  MealO,
  MealModal,
} from '../components';
import globalStyles from '../config/globalStyles';
import colors from '../config/colors';
import {emptyMeals, weekDays} from '../config/fake data';
import {
  _deleteMealsGroup,
  _deleteDayMealsGroup,
  _getMealsGroup,
} from '../api/Groups';
import {useMyStore} from '../../store';
import {groupMealsType, mealTypes} from '../config/types';
import socket from '../utils/socket';

let mealsToDelete = [] as string[];

interface Props {
  meals: groupMealsType[];
  selected: number;
  day: number;
  options: boolean;
  pushMealsToDelete: Function;
  pullMealsToDelete: Function;
  setMealOptions: Function;
  setMeal: Function;
  setMealModal: Function;
}

const Tab = ({
  meals,
  day,
  selected,
  options,
  pullMealsToDelete,
  pushMealsToDelete,
  setMealOptions,
  setMeal,
  setMealModal,
}: Props) => {
  const mlsLst = meals.sort(CompareMeals).map(m => (
    <MealO
      pushMeal={() => pushMealsToDelete(m._id)}
      pullMeal={() => pullMealsToDelete(m._id)}
      edit={() => {
        setMeal(m);
        setMealModal(true);
      }}
      key={m._id}
      meal={m}
      onLongPress={() => setMealOptions(true)}
      options={options}
    />
  ));
  return day === selected ? <>{mlsLst}</> : null;
};

function CompareMeals(a: groupMealsType, b: groupMealsType) {
  const aIndex = mealTypes.indexOf(a.type);
  const bIndex = mealTypes.indexOf(b.type);
  return aIndex - bIndex === 0 ? a.name.localeCompare(b.name) : aIndex - bIndex;
}

export default function MealsScreen({navigation}: any) {
  const [refreshDay, setRefreshDay] = useState(moment());
  const [today, setToday] = useState(moment().subtract(1, 'days').day());
  const [todayDay, setTodayDay] = useState(moment());
  const [meal, setMeal] = useState({} as groupMealsType);

  useEffect(() => {
    if (!refreshDay.isSame(todayDay, 'day')) {
      setTodayDay(refreshDay);
      setToday(refreshDay.day());
    } else {
      setToday(todayDay.day());
    }
  }, [refreshDay]);

  const focused = useIsFocused();
  const pushMealsToDelete = (id: string) => mealsToDelete.push(id);
  const pullMealsToDelete = (id: string) =>
    (mealsToDelete = mealsToDelete.filter(meal => meal !== id));
  const [day, setDay] = useState(today);
  const {groupId, reset, meals} = useMyStore();
  const [mealModal, setMealModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [mealOptions, setMealOptions] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshDay(moment());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const sortedMeals: typeof emptyMeals = (() => {
    const sorted = JSON.parse(JSON.stringify(emptyMeals)); //deep copy?
    meals.forEach(m => {
      switch (m.day) {
        case 'Sunday':
          sorted.sunday.push(m);
          break;
        case 'Monday':
          sorted.monday.push(m);
          break;
        case 'Tuesday':
          sorted.tuesday.push(m);
          break;
        case 'Wednesday':
          sorted.wednesday.push(m);
          break;
        case 'Thursday':
          sorted.thursday.push(m);
          break;
        case 'Friday':
          sorted.friday.push(m);
          break;
        case 'Saturday':
          sorted.saturday.push(m);
          break;
        default:
      }
    });
    return sorted;
  })();

  useEffect(() => {
    setDay(today);
    setMealOptions(false);
  }, [reset, today]);

  useEffect(() => {
    setMealOptions(false);
  }, [day]);

  async function deleteMealsGroup() {
    await _deleteMealsGroup(groupId, mealsToDelete);
    socket.emit('deletemeals', {selected: mealsToDelete, groupId});
    setMealOptions(false);
  }

  async function deleteDayMealsGroup() {
    const dayName = weekDays[day];
    await _deleteDayMealsGroup(groupId, dayName);
    socket.emit('deletedaymeals', {day: dayName, groupId});
  }

  function NextDay() {
    day === 6 && setDay(0);
    day !== 0 && day !== 6 && setDay(prev => prev + 1);
  }

  function PrevDay() {
    day === 0 && setDay(6);
    day > 1 && setDay(prev => prev - 1);
  }

  const dayTabs = (() => {
    const dts = weekDays.map((value, index) => {
      const backgroundColor =
        day === index
          ? colors.details
          : index === today
          ? colors.ripple
          : colors.secondary;
      return (
        <Pressable
          key={index + 'DayTab'}
          style={[styles.dayTabContainer, {backgroundColor: backgroundColor}]}
          onPress={() => setDay(index)}>
          <Text style={[globalStyles.text, styles.dayTabText]}>
            {value.substring(0, 3)}
          </Text>
        </Pressable>
      );
    });
    const lastDay = dts[0];
    dts.splice(0, 1);
    dts.splice(6, 0, lastDay);
    return dts;
  })();

  const tabs = Object.entries(sortedMeals).map(([key, value], index) => (
    <Tab
      key={key + 'Tab'}
      meals={value}
      day={index}
      selected={day}
      options={mealOptions}
      pullMealsToDelete={pullMealsToDelete}
      pushMealsToDelete={pushMealsToDelete}
      setMealOptions={setMealOptions}
      setMeal={setMeal}
      setMealModal={setMealModal}
    />
  ));

  ///////////////////////////////////////////////////////////////////////////////
  return (
    <Background>
      {focused && mealOptions && (
        <GhostBackHandler action={() => setMealOptions(false)} />
      )}
      {focused && !mealOptions && (
        <GhostBackHandler action={navigation.goBack} />
      )}
      <ConfirmModal
        close={() => setConfirmModal(false)}
        visible={confirmModal}
        text={
          mealOptions
            ? `Remove selected meals ?`
            : `Remove ${weekDays[day]} meals ?`
        }
        confirm={mealOptions ? deleteMealsGroup : deleteDayMealsGroup}
      />
      <MealModal
        visible={mealModal}
        close={() => {
          setMealModal(false);
          setMealOptions(false);
        }}
        meal={meal}
        day={weekDays[day]}
      />
      <View style={{flexDirection: 'row', marginBottom: 6, marginTop: 10}}>
        {dayTabs}
      </View>
      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        nestedScrollEnabled>
        <TouchableWithoutFeedback>
          <View style={{paddingBottom: 165}}>{tabs}</View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <AddB
        source={require('../assets/trashIcon.png')}
        containerStyle={{bottom: 160, padding: 15}}
        dimensions={30}
        onPress={() =>
          mealOptions
            ? mealsToDelete.length && setConfirmModal(true)
            : setConfirmModal(true)
        }
      />
      <AddB
        containerStyle={{bottom: 80, padding: 15}}
        dimensions={32}
        onPress={() => {
          setMeal({} as groupMealsType);
          setMealOptions(false);
          setMealModal(true);
          // console.log(mealsToDelete);
        }}
      />
      <View
        style={{
          flexDirection: 'row',
        }}>
        <Pressable
          style={({pressed}) => [
            styles.navWeekBcon,
            {
              backgroundColor: pressed ? colors.tertiary : colors.secondary,
              borderRightWidth: 1,
            },
          ]}
          onPress={() => setTimeout(() => PrevDay(), 0)}>
          <Image
            style={[styles.navWeekBicon, {right: 10}]}
            source={require('../assets/prevArrowIcon.png')}
          />
          <Text style={[globalStyles.text, {fontSize: 18}]}>Previous</Text>
        </Pressable>
        <Pressable
          style={({pressed}) => [
            styles.navWeekBcon,
            {
              backgroundColor: pressed ? colors.tertiary : colors.secondary,
              borderLeftWidth: 1,
            },
          ]}
          onPress={() => setTimeout(() => NextDay(), 0)}>
          <Text style={[globalStyles.text, {fontSize: 18}]}>Next</Text>
          <Image
            style={[styles.navWeekBicon, {left: 10}]}
            source={require('../assets/nextArrowIcon.png')}
          />
        </Pressable>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  dayTabText: {fontSize: 18},
  dayTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.tertiary,
    height: 50,
  },
  navWeekBcon: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    borderColor: colors.tertiary,
  },
  navWeekBicon: {width: 17, height: 17},
});
