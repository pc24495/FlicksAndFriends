import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classes from "./ProfilePicUpload.module.css";
import empty from "./EmptyProfilePic.png";
import ReactEasyCrop from "react-easy-crop";
import Backdrop from "../../Backdrop/Backdrop.js";
import "react-image-crop/dist/ReactCrop.css";
import Button from "../../../Components/Button/Button.js";
import axios from "../../../axiosConfig.js";

const ProfilePicUpload = (props) => {
  const [state, setState] = useState({
    src: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 1,
    croppedImageSrc: null,
    showBackdrop: false,
    inputKey: "Input start",
    emptySrc: null,
  });

  const [imageCrop, setImageCrop] = useState(null);
  const redirectLink = useSelector((state) => state.redirectLink);
  const dispatch = useDispatch();

  const onSelectFile = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        // console.log(reader.result);
        setState({ ...state, src: reader.result, showBackdrop: true });
      });
      // console.log(typeof event.target.files[0]);
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const onBackdropClose = (event) => {
    let randomString = Math.random().toString(36);
    setState({ ...state, showBackdrop: false, inputKey: randomString });
  };

  useEffect(() => {
    async function onComponentLoad() {
      let blob = await fetch(empty).then((r) => r.blob());
      let dataUrl = await new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      setState({ ...state, emptySrc: dataUrl });
    }

    onComponentLoad();
    // eslint-disable-next-line
  }, []);

  const prepareImage = async (event) => {
    const finalImage = await getCroppedImg(state.src, imageCrop);
    // console.log(finalImage);
    setState({ ...state, croppedImageSrc: finalImage, showBackdrop: false });
  };

  const getRadianAngle = (degreeValue) => {
    return (degreeValue * Math.PI) / 180;
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    // set each dimensions to double largest dimension to allow for a safe area for the
    // image to rotate in without being clipped by canvas context
    canvas.width = safeArea;
    canvas.height = safeArea;

    // translate canvas context to a central location on image to allow rotating around the center.
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate(getRadianAngle(rotation));
    ctx.translate(-safeArea / 2, -safeArea / 2);

    // draw rotated image and store data.
    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // paste generated rotate image with correct offsets for x,y crop values.
    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );

    // As Base64 string
    return canvas.toDataURL("image/jpeg");
    // return canvas;
  };

  const onCropChange = (crop) => {
    setState({ ...state, crop: crop });
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setImageCrop(croppedAreaPixels);
  };

  const onZoomChange = (zoom) => {
    setState({ ...state, zoom: zoom });
  };

  const submitImage = async (event) => {
    let token = localStorage.getItem("token");
    console.log(redirectLink);
    // console.log(emptySrc);
    axios
      .patch("/api/users/profilePic", {
        profile_pic: state.croppedImageSrc || state.emptySrc,
        headers: {
          "x-access-token": token,
        },
      })
      .then((res) => {
        if (res.data.auth) {
          dispatch({
            type: "UPDATE_PROFILE_PIC",
            profilePic: state.croppedImageSrc || state.emptySrc,
          });
          props.history.push(redirectLink);
        }
      });
  };

  return (
    <div className={classes.ProfilePicUpload}>
      <div className={classes.UploadSection}>
        <h2 style={{ margin: "0px", color: "var(--nord4)" }}>
          Select a profile picture
        </h2>
        <div className={classes.PicOverlay}>
          +
          <input
            type="file"
            style={{
              opacity: "0.0",
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              width: "100%",
              height: "100%",
            }}
            className={classes.InputPic}
            accept="image/*"
            onChange={onSelectFile}
            key={state.inputKey}
          />
        </div>
        <img
          src={state.croppedImageSrc || empty}
          className={classes.ProfilePicture}
          alt="Profile"
        ></img>
        <Button onClick={submitImage}>Submit</Button>
      </div>
      <Backdrop showBackdrop={state.showBackdrop}>
        <div className={classes.CropBox}>
          {state.src && (
            <ReactEasyCrop
              image={state.src}
              crop={state.crop}
              zoom={state.zoom}
              aspect={state.aspect}
              cropShape="round"
              showGrid={false}
              onCropChange={onCropChange}
              onCropComplete={onCropComplete}
              onZoomChange={onZoomChange}
            ></ReactEasyCrop>
          )}
        </div>
        <div className={classes.ButtonContainer}>
          <Button onClick={onBackdropClose}>Close</Button>
          <Button onClick={prepareImage}>Done</Button>
        </div>
      </Backdrop>
    </div>
  );
};

export default ProfilePicUpload;
