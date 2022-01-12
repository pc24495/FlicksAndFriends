import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Formik, Form, Field } from "formik";
import classes from "./CreatePost.module.css";
import * as Yup from "yup";
import axios from "axios";
import qs from "qs";
import Select from "react-select";

const CreatePost = (props) => {
  const subscriptions = useSelector((state) => {
    return state.subscriptions;
  });

  const [state, setState] = useState({
    shows: [],
    currentShow: { episodes: [] },
    currentSeason: { episodes: [] },
    currentEpisode: {},
    show: "0",
    season: "0",
    episode: "0",
  });

  useEffect(() => {
    const subscriptionIDs =
      subscriptions && subscriptions.length > 0
        ? subscriptions.map((sub) => {
            return sub.show_id;
          })
        : null;
    if (subscriptions && subscriptions.length > 0) {
      axios
        .get("/api/shows", {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
          params: {
            subscriptionIDs,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params);
          },
        })
        .then((res) => {
          if (res.data.auth) {
            console.log(String(res.data.shows[0].tv_id));
            setState({
              shows: res.data.shows,
              currentShow: res.data.shows[0],
              currentSeason: res.data.shows[0].episodes[0],
              currentEpisode: res.data.shows[0].episodes[0].episodes[0],
              show: String(res.data.shows[0].tv_id),
              season: String(res.data.shows[0].episodes[0].season_id),
              episode: String(
                res.data.shows[0].episodes[0].episodes[0].episode_id
              ),
            });
          } else {
            props.history.push("/login");
          }
        });
    }
    // eslint-disable-next-line
  }, [subscriptions]);

  const onShowChange = (event) => {
    const selected_show_tv_id = parseInt(event.target.value);
    const selectedShow = state.shows.find((show) => {
      return show.tv_id === selected_show_tv_id;
    });
    setState({
      ...state,
      currentShow: selectedShow,
      currentSeason: selectedShow.episodes[0],
      currentEpisode: selectedShow.episodes[0].episodes[0],
    });
  };

  const onSeasonChange = (event) => {
    const selected_season_season_id = parseInt(event.target.value);
    const selectedSeason = state.currentShow.episodes.find((season) => {
      return season.season_id === selected_season_season_id;
    });
    setState({
      ...state,
      currentSeason: selectedSeason,
      currentEpisode: selectedSeason.episodes[0],
    });
  };

  const onEpisodeChange = (event) => {
    const selected_episode_episode_id = parseInt(event.target.value);
    const selectedEpisode = state.currentSeason.episodes.find((episode) => {
      return episode.episode_id === selected_episode_episode_id;
    });
    console.log(selectedEpisode);
    setState({
      ...state,
      currentEpisode: selectedEpisode,
    });
  };

  // <select name="show" onChange={onShowChange}>
  //                       {state.shows.map((show, index) => {
  //                         if (index === 0) {
  //                           return (
  //                             <option value={show.tv_id} selected>
  //                               {show.title}
  //                             </option>
  //                           );
  //                         } else {
  //                           return (
  //                             <option value={show.tv_id}>{show.title}</option>
  //                           );
  //                         }
  //                       })}
  //                     </select>

  //Validation schema

  // validationSchema={Yup.object({
  //   post_text: Yup.string()
  //     .max(40000, "Text body too long! Character limit is 40000: ")
  //     .required("Required"),
  //   episode_air_date: Yup.string()
  //     .max(
  //       10,
  //       "Air date must be a 10-char string formatted as YYYY-MM-DD"
  //     )
  //     .min(
  //       10,
  //       "Air date must be a 10-char string formatted as YYYY-MM-DD"
  //     )
  //     .required(),
  //   episode_order: Yup.number().integer(),
  //   tv_id: Yup.number("Must be a number!")
  //     .integer("Must be an integer!")
  //     .moreThan(-1, "Must be a non-negative integer!")
  //     .required("Required"),
  //   type: Yup.string()
  //     .oneOf(["spoiler", "announcement"])
  //     .required("Required"),
  //   episode_number: Yup.number().integer().required(),
  //   season_number: Yup.number().integer().required(),
  //   title: Yup.string()
  //     .max(80, "Title cannot be longer than 80 characters")
  //     .required(),
  // })}

  // initialValues={{
  //   post_text: "",
  //   tv_id: 0,
  //   type: "announcement",
  // }}

  return (
    <div className={classes.CreatePost}>
      <div className={classes.CreatePostInner}>
        <h2 className={classes.Header}>Create Post</h2>
        {
          <Formik
            className={classes.Formik}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              console.log(values);
            }}
            initialValues={{
              post_text: "",
              type: "announcement",
              show: state.show,
              season: state.season,
              episode: state.episode,
            }}
            validationSchema={Yup.object({
              post_text: Yup.string()
                .max(40000, "Text body too long! Character limit is 40000: ")
                .required("Required"),
              type: Yup.string().oneOf(["spoiler", "announcement"]),
              show: Yup.string(),
              season: Yup.string(),
            })}
            enableReinitialize={true}
          >
            {({ errors, ...props }) => {
              return (
                <Form className={classes.Form}>
                  <Field
                    className={classes.TextInput}
                    name="post_text"
                    id="post_text"
                    as="textarea"
                  />
                  <div className={classes.Options}>
                    <div className={classes.RadioButtons}>
                      <label className={classes.Radio}>
                        <Field name="type" type="radio" value="announcement" />
                        Announcement
                      </label>
                      <label className={classes.Radio}>
                        <Field name="type" type="radio" value="spoiler" />
                        Spoiler
                      </label>
                    </div>

                    <div className={classes.Select}>
                      <Field name="show" as="select" onChange={onShowChange}>
                        {state.shows.map((show, index) => {
                          if (index === 0) {
                            return (
                              <option value={show.tv_id} selected>
                                {show.title}
                              </option>
                            );
                          } else {
                            return (
                              <option value={show.tv_id}>{show.title}</option>
                            );
                          }
                        })}
                      </Field>
                      <span className={classes.Focus}></span>
                    </div>
                    <div className={classes.Select}>
                      <Field
                        as="select"
                        name="season"
                        onChange={onSeasonChange}
                      >
                        {state.currentShow.episodes.map((season, index) => {
                          if (index === 0) {
                            return (
                              <option value={season.season_id} selected>
                                {season.season_name}
                              </option>
                            );
                          } else {
                            return (
                              <option value={season.season_id}>
                                {season.season_name}
                              </option>
                            );
                          }
                        })}
                      </Field>
                      <span className={classes.Focus}></span>
                    </div>
                    <div className={classes.Select}>
                      <Field
                        name="episode"
                        onChange={onEpisodeChange}
                        component="select"
                      >
                        {state.currentSeason.episodes.map((episode, index) => {
                          return (
                            <option value={episode.episode_id} selected>
                              {episode.title}
                            </option>
                          );
                        })}
                      </Field>
                      <span className={classes.Focus}></span>
                    </div>
                    <button className={classes.Submit} type="submit">
                      Submit
                    </button>
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

// {state.shows.map((show, index) => {
//   if (index === 0) {
//     return (
//       <option value={show.tv_id} selected>
//         {show.title}
//       </option>
//     );
//   } else {
//     return (
//       <option value={show.tv_id}>{show.title}</option>
//     );
//   }
// })}

// if (!props.isSubmitting) {
//   return (
//     <Form className={classes.Form}>
//       <textarea
//         className={classes.TextInput}
//         name="post_text"
//         id="post_text"
//       ></textarea>
//       <div className={classes.Options}>
//         <div className={classes.RadioButtons}>
//           <label className={classes.Radio}>
//             <input
//               type="radio"
//               name="type"
//               value="announcement"
//               checked
//             />
//             Announcement
//           </label>
//           <label className={classes.Radio}>
//             <input type="radio" name="type" value="spoiler" />
//             Spoiler
//           </label>
//         </div>

//         <div className={classes.Select}>
//           <select name="show" onChange={onShowChange}>
// {state.shows.map((show, index) => {
//   if (index === 0) {
//     return (
//       <option value={show.tv_id} selected>
//         {show.title}
//       </option>
//     );
//   } else {
//     return (
//       <option value={show.tv_id}>{show.title}</option>
//     );
//   }
// })}
//           </select>
//           <span className={classes.Focus}></span>
//         </div>
//         <div className={classes.Select}>
//           <select name="season" onChange={onSeasonChange}>
//             {state.currentShow.episodes.map((season, index) => {
//               if (index === 0) {
//                 return (
//                   <option value={season.season_id} selected>
//                     {season.season_name}
//                   </option>
//                 );
//               } else {
//                 return (
//                   <option value={season.season_id}>
//                     {season.season_name}
//                   </option>
//                 );
//               }
//             })}
//           </select>
//           <span className={classes.Focus}></span>
//         </div>
//         <div className={classes.Select}>
//           <select name="episode" onChange={onEpisodeChange}>
//             {state.currentSeason.episodes.map(
//               (episode, index) => {
//                 if (index === 0) {
//                   return (
//                     <option value={episode.episode_id} selected>
//                       {episode.title}
//                     </option>
//                   );
//                 } else {
//                   return (
//                     <option value={episode.episode_id}>
//                       {episode.title}
//                     </option>
//                   );
//                 }
//               }
//             )}
//           </select>
//           <span className={classes.Focus}></span>
//         </div>
//         <button className={classes.Submit} type="submit">
//           Submit
//         </button>
//       </div>
//     </Form>
//   );
// } else {
//   return (
//     <div className={classes.FormLoaderContainer}>
//       <div className={classes.loader}></div>
//     </div>
//   );
// }
