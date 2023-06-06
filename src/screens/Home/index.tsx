import { useNavigation } from '@react-navigation/native'
import { View, Text, TouchableOpacity } from 'react-native'
import { StackTypes } from '../../Navigator'

export default function HomeScreen() {
  const navigation = useNavigation<StackTypes>()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#aec6fb',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Text>Testando 1 2 3</Text>

      <TouchableOpacity
        style={{ backgroundColor: 'red', padding: 8, borderRadius: 8 }}
        onPress={() => navigation.navigate('AnotherScreen')}
      >
        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
          Go To another Screen
        </Text>
      </TouchableOpacity>
      <View style={{ height: '5%' }} />
      <TouchableOpacity
        style={{ backgroundColor: 'gray', padding: 8, borderRadius: 8 }}
        onPress={() => navigation.navigate('ReadPDF')}
      >
        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
          Go To another Screen
        </Text>
      </TouchableOpacity>
    </View>
  )
}
