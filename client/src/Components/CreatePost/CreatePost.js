import React from "react";
import { Formik, Form } from "formik";
import classes from "./CreatePost.module.css";

const CreatePost = (props) => {
  // const subscriptions = useSelector((state) => {
  //   return state.subscriptions;
  // });

  return (
    <div className={classes.CreatePost}>
      <div className={classes.CreatePostInner}>
        <h2 className={classes.Header}>Create Post</h2>
        {
          <Formik
            className={classes.Formik}
            initialValues={{
              post_text: "",
              tv_id: 0,
              type: "spoiler",
            }}
          >
            {(props) => {
              return (
                <Form className={classes.Form}>
                  <textarea className={classes.TextInput}></textarea>
                  <div className={classes.Options}>
                    <div className={classes.RadioButtons}>
                      <label className={classes.Radio}>
                        <input type="radio" name="radio" checked />
                        Announcement
                      </label>
                      <label className={classes.Radio}>
                        <input type="radio" name="radio" />
                        Spoiler
                      </label>
                    </div>

                    <div className={classes.Select}>
                      <select>
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                      <span className={classes.Focus}></span>
                    </div>
                    <div className={classes.Select}>
                      <select>
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                      <span className={classes.Focus}></span>
                    </div>
                    <div className={classes.Select}>
                      <select>
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                      <span className={classes.Focus}></span>
                    </div>
                    <button className={classes.Submit}>Submit</button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        }
      </div>
    </div>
  );
};

// <div className={classes.Select}>
// <select className={classes.Select}>
//   <option>Option 1</option>
//   <option>Option 2</option>
// </select>
// </div>

export default CreatePost;
