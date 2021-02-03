import React from 'react';
import {
    FlatList,
    Image,
    Text,
    View,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { API_KEY } from './config';

const { width, height } = Dimensions.get('screen');

const IMAGE_SIZE = 80;
const SPACING = 10;

const API_URL =
    'https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20';

const fetchImagesFromExternal = async () => {
    const data = await fetch(API_URL, { headers: { Authorization: API_KEY } });

    const { photos } = await data.json();

    return photos;
};

export default () => {
    const [images, setImages] = React.useState(null);

    React.useEffect(() => {
        const fetchImages = async () => {
            const images = await fetchImagesFromExternal();

            setImages(images);
        };

        fetchImages();
    }, []);

    const topRef = React.useRef<FlatList>(null);
    const bottomRef = React.useRef<FlatList>(null);

    const [activeIndex, setActiveIndex] = React.useState(0);

    const scrollToActiveIndex = (index: number) => {
        setActiveIndex(index);

        topRef?.current?.scrollToOffset({
            offset: index * width,
            animated: true,
        });

        if (index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2) {
            bottomRef?.current?.scrollToOffset({
                offset:
                    index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
                animated: true,
            });
        } else {
            bottomRef?.current?.scrollToOffset({
                offset: 0,
                animated: true,
            });
        }
    };

    if (!images) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <FlatList
                ref={topRef}
                data={images}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    scrollToActiveIndex(
                        Math.round(event.nativeEvent.contentOffset.x / width),
                    );
                }}
                renderItem={({ item }) => {
                    return (
                        <View style={{ width, height }}>
                            <Image
                                source={{ uri: item.src.portrait }}
                                style={[StyleSheet.absoluteFill]}
                            />
                        </View>
                    );
                }}
            />

            <FlatList
                ref={bottomRef}
                data={images}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.bottomList}
                contentContainerStyle={{ paddingHorizontal: SPACING }}
                renderItem={({ item, index }) => {
                    return (
                        <TouchableOpacity
                            onPress={() => scrollToActiveIndex(index)}
                        >
                            <Image
                                source={{ uri: item.src.portrait }}
                                style={{
                                    width: IMAGE_SIZE,
                                    height: IMAGE_SIZE,
                                    borderRadius: 12,
                                    marginRight: SPACING,
                                    borderWidth: 2,
                                    borderColor:
                                        activeIndex === index
                                            ? '#fff'
                                            : 'transparent',
                                }}
                            />
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bottomList: {
        position: 'absolute',
        bottom: IMAGE_SIZE,
    },
});
