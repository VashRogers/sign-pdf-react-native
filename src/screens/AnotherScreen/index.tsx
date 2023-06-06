import React from 'react'
import { StyleSheet, Dimensions, View, Text } from 'react-native'
import Pdf from 'react-native-pdf'

export default class AnotherScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Pdf
          trustAllCerts={false}
          source={{
            uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf',
            cache: true
          }}
          onLoadComplete={(numberOfPages) => {
            console.log(`Number of pages: ${numberOfPages}`)
          }}
          onPageChanged={(page) => {
            console.log(`Current page: ${page}`)
          }}
          onError={(error) => {
            console.log(error)
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`)
          }}
          style={styles.pdf}
        />
        <Text>Teste</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }
})
