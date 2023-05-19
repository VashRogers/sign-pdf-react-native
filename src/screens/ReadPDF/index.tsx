import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Alert } from "react-native";


import Pdf from "react-native-pdf";
import * as FileSystem from 'expo-file-system';
import Signature from 'react-native-signature-canvas';
import { PDFDocument } from "pdf-lib";
import { decode, encode} from 'base-64';

interface SourceTypes{
    uri:string;
    cache:boolean;
}

export default function ReadPDF () {
    
    const [ pdfPath, setPdfPath ] = useState<string>("");
    const [ fileDownloaded, setFileDownloaded ] = useState(false);
    const [ signaturePad, setSignaturePad ] = useState(false);
    const [ pdfEditMode, setPdfEditMode ] = useState(false);

    const [ signBase64, setSignBase64 ] = useState("")
    const [ signatureArrayBuffer, setSignatureArrayBuffer ] = useState<ArrayBufferLike | Uint8Array | string>("");
    const [ pdfBase64, setPdfBase64 ] = useState<string>("");
    const [ pdfArrayBuffer, setPdfArrayBuffer ] = useState<any>();
    const [ newPdfSaved, setNewPdfSaved ] = useState(false);
    const [ newPdfPath, setNewPdfPath ] = useState<string>("");
    const [ pageWidth, setPageWidth ] = useState(0);
    const [ pageHeight, setPageHeight ] = useState(0);

    useEffect(() => {
        // downloadFile();

        if(signBase64){
            setSignatureArrayBuffer(_base64ToArrayBuffer(signBase64))
        }
        if(newPdfSaved){
            setPdfPath(newPdfPath);
            setPdfArrayBuffer(_base64ToArrayBuffer(pdfBase64));
        }
        console.log('File Path: ', pdfPath);
    }, [signBase64, pdfPath, newPdfSaved]);

    const getSignature = () => {
        console.log("___getSignature -> Start");
        setSignaturePad(true);
    }

    const handleSignature = (sign: string) => {
        setSignBase64(sign.replace("data:image/png;base64,", ""));
        setSignaturePad(false);
        setPdfEditMode(true);
    }

    const _base64ToArrayBuffer = (base64: string) => {
        const binary_string = decode(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    const _unint8ToBase64 = (u8Arr:any) => {
        const CHUNK_SIZE = 0x8000
        let index = 0;
        const length = u8Arr.length;
        let result = "";
        let slice;
        while(index < length){
            slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
            result += String.fromCharCode.apply(null, slice);
            index += CHUNK_SIZE;
        }
        return encode(result);
    }

    const downloadFile = async () => {
        if(!fileDownloaded){
            try{
                Alert.alert('Pdf Baixado!');
                const fileUri = FileSystem.documentDirectory + 'example.pdf';
                const downloadUri = 'http://samples.leanpub.com/thereactnativebook-sample.pdf';
                const { uri } = await FileSystem.downloadAsync(downloadUri, fileUri);
                
                console.log('Arquivo salvo em: ', uri);
                setPdfPath(uri);
                readFile(uri);
                setFileDownloaded(true)
                
            } catch(err) {
                console.log('Erro ao salvar pdf: ', err);
            }
        }

    }
    
    const readFile = async (uri:string) => {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        try{
            console.log('Read file da certo?');
            if(fileInfo.exists){
                const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                setPdfBase64(fileContent);
                setPdfArrayBuffer(_base64ToArrayBuffer(fileContent));
            } else {
                console.log('Arquivo não existente')
            }

        } catch(error) {
            console.log('Erro ao ler o arquivo: ', error);
        }

    }

    const handleSingleTap = async(page:number, x:number, y:number) => {
        if(pdfEditMode) {
            console.log('Entra aqui? em handleSingleTap')
            setNewPdfSaved(false);
            setPdfPath("");
            setPdfEditMode(false);

            const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
            const pages = pdfDoc.getPages();
            const firstPage = pages[page - 1];

            const signatureImg = await pdfDoc.embedPng(signatureArrayBuffer);

            if(Platform.OS === 'ios') {
                firstPage.drawImage(signatureImg, {
                    x:((pageWidth * (x - 12)) / Dimensions.get('window').width),
                    y:pageHeight - ((pageHeight * (y + 12))/540),
                    width:50,
                    height:50
                });
            } else {
                firstPage.drawImage(signatureImg, {
                    x: (firstPage.getWidth() * x ) / pageWidth,
                    y: (firstPage.getHeight() - ((firstPage.getHeight() * y ) / pageHeight)) - 25,
                    width: 50,
                    height: 50,
                })
            }

            const pdfBytes = await pdfDoc.save();
            const pdfBase64 = _unint8ToBase64(pdfBytes);
            const path = FileSystem.documentDirectory + 'example.pdf';

            await writeFile(path, pdfBase64);

        }
    }

    const writeFile = async (path:string, pdfBase64:string) => {
        console.log('Erro em write file?')
        await FileSystem.writeAsStringAsync(path, pdfBase64, { encoding: FileSystem.EncodingType.Base64 })
        setNewPdfPath(path);
        setNewPdfSaved(true);
        setPdfBase64(pdfBase64);
            
    }

    let source:SourceTypes = { uri:pdfPath, cache:true };

    return(
        <View style={styles.container}>

            {/* <View style={styles.pdfContainer}> */}
                
                {signaturePad ? (
                    <Signature 
                        onOK={(sign) => handleSignature(sign)}
                        onEmpty={() => console.log('___onEmpty')}
                        descriptionText="Sign"
                        clearText="Clear"
                        confirmText="Save"
                    />
                ) : ((fileDownloaded) && (
                        <View>
                            {pdfPath ? (
                                <View>
                                    <Text style={styles.headerText}>React Native Digital PDF Signature</Text>
                                    <Pdf
                                        minScale={1.0}
                                        maxScale={3.0}
                                        scale={1.0}
                                        spacing={0}
                                        fitPolicy={0}
                                        enablePaging={true}
                                        source={source}
                                        onLoadComplete={(numberOfPages, filePath, {width, height})=>{
                                        setPageWidth(width);
                                        setPageHeight(height);
                                        }}
                                        onPageSingleTap={(page, x, y) => {
                                            handleSingleTap(page, x, y);
                                        }}
                                        style={styles.pdf}
                                    />
                                </View>
                            ) : (
                                <View style={styles.button}>
                                    <Text style={styles.buttonText}>Saving PDF File...</Text>
                                </View>
                            )}
                            {pdfEditMode ? (
                                <View style={styles.message}>
                                    <Text>Modo de Edição</Text>
                                    <Text>Toque onde deseja assinar</Text>
                                </View>
                            ) : (
                                pdfPath && (
                                    <View>
                                        <TouchableOpacity
                                            onPress={getSignature}
                                            style={styles.button}
                                        >
                                            <Text style={styles.buttonText}>Assine o documento</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            )}

                        </View>
                ))}

            {/* </View> */}
            
            <TouchableOpacity
                onPress={() => downloadFile()}
                style={styles.btnContainer}
            >
                <Text>Baixar PDF</Text>
            </TouchableOpacity>          
            
            <Text>Teste</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#aec6fb'
    },
    
    pdfContainer:{
        backgroundColor:'white',
    },
    pdfStyles:{
        width: Dimensions.get("window").width,
        height: 540,
    },

    pdf: {
        width: Dimensions.get("window").width,
        height: 540,
    },

    btnContainer:{
        backgroundColor:'green',
        padding:8,
        borderRadius:8
    },


    headerText: {
        color: "#508DBC",
        fontSize: 20,
        marginBottom: 20,
        alignSelf: "center"
    },
    button: {
        alignItems: "center",
        backgroundColor: "#508DBC",
        padding: 10,
        marginVertical: 10
    },
    buttonText: {
        color: "#DAFFFF",
    },

    message: {
        alignItems: "center",
        padding: 15,
        backgroundColor: "#FFF88C"
    }
})

{/* <Pdf 
    source={{ uri:pdfPath, cache:true }}
    onLoadComplete={(numberOfPages,filePath, {width, height})=>{
        console.log(`number of pages: ${numberOfPages}`);
        console.log(`width: ${width}`);
        console.log(`height: ${height}`);
    }}
    
    minScale={1.0}
    maxScale={2.0}
    scale={1.0}
    spacing={0}
    fitPolicy={0}
    enablePaging={true}

    onPageSingleTap={(page, x, y) => handleSingleTap(page, x, y)}

    style={styles.pdfStyles} 
/> */}