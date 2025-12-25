import { useRef, useState, useEffect } from "react";
import { customerAPI } from "../../../../../api/customer";
import { Modal, View, Animated, PanResponder, TouchableOpacity, ActivityIndicator, Dimensions, } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from "../../../../../components";
import Customerstyles from "../style/style";
import CloseCircle from "../../../../../components/icons/CloseCircle";
import { colors } from "../../../../../styles/colors";

const { width } = Dimensions.get("window");

const DocumentModal = ({ showDocumentModal, s3Path, doctypeName, fileName = "", close }) => {
    const [loadingDoc, setLoadingDoc] = useState(false);
    const [signedUrl, setSignedUrl] = useState(null);
    const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
    const isFetchingRef = useRef(false);
    const lastFetchedPathRef = useRef(null);

    useEffect(() => {
        if (showDocumentModal && s3Path) {
            if (!isFetchingRef.current && lastFetchedPathRef.current !== s3Path) {
                fetchSignedUrl();
            }
        } else if (!showDocumentModal) {
            // Reset when modal closes
            setIsFullScreenPreview(false);
            setSignedUrl(null);
            lastFetchedPathRef.current = null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDocumentModal, s3Path]);

    const fetchSignedUrl = async () => {
        if (!s3Path || isFetchingRef.current) return;

        // Mark as fetching and store the path
        isFetchingRef.current = true;
        lastFetchedPathRef.current = s3Path;

        setLoadingDoc(true);
        try {
            const response = await customerAPI.getDocumentSignedUrl(s3Path);
            if (response?.data?.signedUrl) {
                setSignedUrl(response.data.signedUrl);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load document');
        } finally {
            setLoadingDoc(false);
            isFetchingRef.current = false;
        }
    };

    const closeModal = () => {
        close?.()
        setSignedUrl(null);
        setIsFullScreenPreview(false);
    };

    const isImageFile = fileName?.toLowerCase().endsWith('.jpg') ||
        fileName?.toLowerCase().endsWith('.jpeg') ||
        fileName?.toLowerCase().endsWith('.png');


    const ZoomableImage = ({ imageUri, containerWidth, containerHeight }) => {
        const scale = useRef(new Animated.Value(1)).current;
        const translateX = useRef(new Animated.Value(0)).current;
        const translateY = useRef(new Animated.Value(0)).current;

        const savedScale = useRef(1);
        const currentTranslateX = useRef(0);
        const currentTranslateY = useRef(0);
        const lastTap = useRef(null);
        const initialDistance = useRef(null);
        const initialScale = useRef(1);
        const touchStartTime = useRef(null);
        const activeTouches = useRef([]);

        const MIN_SCALE = 1;
        const MAX_SCALE = 5;

        // Calculate distance between two touch points
        const getDistance = (touches) => {
            if (touches.length < 2) return null;
            const dx = touches[0].pageX - touches[1].pageX;
            const dy = touches[0].pageY - touches[1].pageY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        // Handle touch start - better multi-touch detection
        const handleTouchStart = (evt) => {
            const touches = evt.nativeEvent.touches;
            activeTouches.current = Array.from(touches);

            if (touches.length === 2) {
                // Pinch gesture
                initialDistance.current = getDistance(touches);
                initialScale.current = savedScale.current;
                touchStartTime.current = Date.now();
            } else if (touches.length === 1) {
                // Single touch - check for double tap
                const now = Date.now();
                const DOUBLE_TAP_DELAY = 300;

                if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
                    // Double tap detected
                    if (savedScale.current > MIN_SCALE) {
                        // Reset zoom
                        Animated.parallel([
                            Animated.spring(scale, {
                                toValue: MIN_SCALE,
                                useNativeDriver: true,
                                tension: 50,
                                friction: 7,
                            }),
                            Animated.spring(translateX, {
                                toValue: 0,
                                useNativeDriver: true,
                                tension: 50,
                                friction: 7,
                            }),
                            Animated.spring(translateY, {
                                toValue: 0,
                                useNativeDriver: true,
                                tension: 50,
                                friction: 7,
                            }),
                        ]).start(() => {
                            savedScale.current = MIN_SCALE;
                            currentTranslateX.current = 0;
                            currentTranslateY.current = 0;
                        });
                    } else {
                        // Zoom in
                        Animated.spring(scale, {
                            toValue: 2,
                            useNativeDriver: true,
                            tension: 50,
                            friction: 7,
                        }).start(() => {
                            savedScale.current = 2;
                        });
                    }
                    lastTap.current = null;
                } else {
                    lastTap.current = now;
                }

                // Save current translation for pan
                translateX.stopAnimation((x) => {
                    currentTranslateX.current = x;
                });
                translateY.stopAnimation((y) => {
                    currentTranslateY.current = y;
                });
            }
        };

        // Handle touch move - better multi-touch detection
        const handleTouchMove = (evt) => {
            const touches = evt.nativeEvent.touches;
            activeTouches.current = Array.from(touches);

            if (touches.length === 2) {
                const currentDistance = getDistance(touches);

                // Initialize distance if not set
                if (!initialDistance.current && currentDistance) {
                    initialDistance.current = currentDistance;
                    initialScale.current = savedScale.current;
                }

                // Perform pinch zoom
                if (currentDistance && initialDistance.current && initialDistance.current > 0) {
                    const scaleRatio = currentDistance / initialDistance.current;
                    const newScale = initialScale.current * scaleRatio;
                    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

                    scale.setValue(clampedScale);
                    savedScale.current = clampedScale;
                }
            }
        };

        // Handle touch end
        const handleTouchEnd = (evt) => {
            const touches = evt.nativeEvent.touches;
            activeTouches.current = Array.from(touches);

            if (touches.length === 0) {
                initialDistance.current = null;
                translateX.stopAnimation((x) => {
                    translateY.stopAnimation((y) => {
                        constrainTranslation(savedScale.current, x, y);
                    });
                });
            }
        };

        const constrainTranslation = (scaleValue, currentX, currentY) => {
            if (scaleValue <= MIN_SCALE) {
                Animated.parallel([
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 7,
                    }),
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 7,
                    }),
                ]).start();
                currentTranslateX.current = 0;
                currentTranslateY.current = 0;
            } else {
                const maxTranslateX = (containerWidth * (scaleValue - 1)) / 2;
                const maxTranslateY = (containerHeight * (scaleValue - 1)) / 2;

                const clampedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, currentX));
                const clampedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, currentY));

                Animated.parallel([
                    Animated.spring(translateX, {
                        toValue: clampedX,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 7,
                    }),
                    Animated.spring(translateY, {
                        toValue: clampedY,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 7,
                    }),
                ]).start();

                currentTranslateX.current = clampedX;
                currentTranslateY.current = clampedY;
            }
        };

        const panResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: (evt) => {
                    return true;
                },
                onMoveShouldSetPanResponder: (evt) => {
                    return true;
                },
                onPanResponderGrant: (evt) => {
                    handleTouchStart(evt);
                },
                onPanResponderMove: (evt, gestureState) => {
                    const touches = evt.nativeEvent.touches;

                    // Handle pinch in touch move handler
                    handleTouchMove(evt);

                    // Handle single finger pan when zoomed
                    if (touches.length === 1 && savedScale.current > MIN_SCALE) {
                        const newX = currentTranslateX.current + gestureState.dx;
                        const newY = currentTranslateY.current + gestureState.dy;
                        translateX.setValue(newX);
                        translateY.setValue(newY);
                    }
                },
                onPanResponderRelease: (evt) => {
                    handleTouchEnd(evt);
                },
                onPanResponderTerminate: () => {
                    initialDistance.current = null;
                    activeTouches.current = [];
                },
            })
        ).current;

        const animatedStyle = {
            transform: [
                { translateX },
                { translateY },
                { scale },
            ],
        };

        return (
            <View
                style={[Customerstyles.zoomableImageWrapper, { width: containerWidth, height: containerHeight }]}
                {...panResponder.panHandlers}
            >
                <Animated.Image
                    source={{ uri: imageUri }}
                    style={[Customerstyles.previewImage, animatedStyle]}
                    resizeMode="contain"
                />
            </View>
        );
    };



    // Full Screen Image Preview
    if (isFullScreenPreview && signedUrl && isImageFile) {
        return (
            <Modal
                visible={showDocumentModal}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
                statusBarTranslucent
            >
                <View style={Customerstyles.fullScreenPreviewContainer}>
                    <View style={Customerstyles.fullScreenPreviewHeader}>
                        <TouchableOpacity onPress={() => setIsFullScreenPreview(false)} style={Customerstyles.fullScreenCloseButton}>
                            <Icon name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <ZoomableImage
                        imageUri={signedUrl}
                        containerWidth={width}
                        containerHeight={Dimensions.get('window').height}
                    />
                </View>
            </Modal>
        );
    }

    // Regular Modal View
    return (
        <Modal
            visible={showDocumentModal}
            transparent
            animationType="fade"
            onRequestClose={closeModal}
        >
            <View style={Customerstyles.modalOverlay}>
                <View style={Customerstyles.documentModalContent}>
                    <View style={Customerstyles.modalHeader}>
                        <AppText style={Customerstyles.modalTitle}>
                            {doctypeName || fileName || 'DOCUMENT'}
                        </AppText>
                        <TouchableOpacity onPress={closeModal}>
                            <CloseCircle />
                        </TouchableOpacity>
                    </View>

                    <View style={Customerstyles.documentImageContainer}>
                        {loadingDoc ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : signedUrl && isImageFile ? (
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => setIsFullScreenPreview(true)}
                                style={Customerstyles.imagePreviewTouchable}
                            >
                                <ZoomableImage
                                    imageUri={signedUrl}
                                    containerWidth={width * 0.95 - 32}
                                    containerHeight={300}
                                />
                            </TouchableOpacity>
                        ) : (
                            <View style={Customerstyles.dummyDocument}>
                                <Icon name="document-text" size={100} color="#999" />
                                <AppText style={Customerstyles.documentName}>{fileName} </AppText>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};



export default DocumentModal;