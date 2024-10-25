import moment from 'moment';
import {View, Text, ScrollView, TouchableWithoutFeedback} from 'react-native';

import {useMyStore} from '../../store';
import {BackB, OptionsBar} from '../components';
import {Background} from '../components/Background';
import globalStyles from '../config/globalStyles';
import {BirthdatesScreenProps} from '../navigation/HomeStack';

export default function BirthdatesScreen({navigation}: BirthdatesScreenProps) {
  const {members} = useMyStore();
  const birthdaysList = members
    .sort((a, b) => {
      const dateA = moment(a.birthdate);
      const dateB = moment(b.birthdate);
      return dateA.isAfter(dateB) ? 1 : dateA.isBefore(dateB) ? -1 : 0;
    })
    .map(m => {
      if (m.birthdate) {
        const date = moment(m.birthdate).format('DD MMMM YYYY');
        return (
          <TouchableWithoutFeedback key={m.userId}>
            <View style={{justifyContent: 'center', padding: 15}}>
              <Text style={{color: m.color, fontSize: 18}}>{m.nickname}</Text>
              <Text style={[globalStyles.text, {fontSize: 20}]}>{date}</Text>
            </View>
          </TouchableWithoutFeedback>
        );
      }
    });

  //////////////////////////////////////////////////////////////////////////////
  return (
    <Background>
      <OptionsBar>
        <BackB onPress={navigation.goBack} />
      </OptionsBar>
      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        nestedScrollEnabled>
        {birthdaysList}
      </ScrollView>
    </Background>
  );
}
