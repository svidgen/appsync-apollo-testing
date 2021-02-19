import React, { Component, useState, useEffect } from "react";
import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";
import { listNotes as listNotesGQL } from "./graphql/queries";
import {
  createNote as createNoteGQL,
  deleteNote as deleteNoteGQL,
} from "./graphql/mutations";
import {
  onCreateNote as onCreateNoteGQL,
  onUpdateNote as onUpdateNoteGQL,
  onDeleteNote as onDeleteNoteGQL,
} from "./graphql/subscriptions";

const listNotesQuery = gql(listNotesGQL);
const createNoteQuery = gql(createNoteGQL);
const deleteNoteQuery = gql(deleteNoteGQL);
const onCreateNoteQuery = gql(onCreateNoteGQL);
const onUpdateNoteQuery = gql(onUpdateNoteGQL);
const onDeleteNoteQuery = gql(onDeleteNoteGQL);

function NoteEditor() {
  const [notes, setNotes] = useState([]);
  const [newNoteName, setNewNoteName] = useState("");
  const [newNoteDetails, setNewNoteDetails] = useState("");

  const {
    loading: listNotesLoading,
    error: listNotesError,
    data: listNotesData,
  } = useQuery(listNotesQuery);
  const [addNote, { data: createNoteData }] = useMutation(createNoteQuery);
  const [deleteNote] = useMutation(deleteNoteQuery);

  const { data: onCreateNoteData } = useSubscription(onCreateNoteQuery);
  const { data: onDeleteNoteData } = useSubscription(onDeleteNoteQuery);

  function handleSubmit(e) {
    e.preventDefault();
    addNote({
      variables: {
        input: {
          name: newNoteName,
          details: newNoteDetails,
        },
      },
    });
    setNewNoteName("");
    setNewNoteDetails("");
  };

  function handleDelete(note) {
    deleteNote({
      variables: {
        input: {
          id: note.id,
        },
      },
    });
  };

  if (listNotesLoading) return <p>Loading ...</p>;
  if (listNotesError) return <p>Error!</p>;

  return (
    <div className="App">
      <header className="App-header">
        <h3>My Notes</h3>
      </header>
      <div>
        <div>
          {listNotesData.listNotes.items.map((note) => (
            <div className="App-note" key={note.id}>
              <div className="delete" onClick={(e) => handleDelete(note)}>
                X
              </div>
              <h4 className="name">{note.name}</h4>
              <div className="details">{note.details}</div>
            </div>
          ))}
        </div>
        <h4>Add a Note:</h4>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
            />
          </div>
          <div>
            <label>Details:</label>
            <textarea
              value={newNoteDetails}
              onChange={(e) => setNewNoteDetails(e.target.value)}
            ></textarea>
          </div>
          <div>
            <input type="submit" value="Add" />
          </div>
        </form>
      </div>
      <h3>Last Note Created:</h3>
      <pre>
        {onCreateNoteData ? (
          <div className="App-note">
            <h4 className="name">{onCreateNoteData.onCreateNote.name}</h4>
            <div className="details">
              {onCreateNoteData.onCreateNote.details}
            </div>
          </div>
        ) : (
          ""
        )}
      </pre>
    </div>
  );
}

export default NoteEditor;
