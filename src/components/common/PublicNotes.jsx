import React, { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import CakeSpinner from "./CakeSpinner";
import editIcon from "../../assets/icons/pencil.svg";
import {
  editSubPageDiningConfigApi,
  getSubPageDiningConfigByIDApi,
} from "../../api/configCategory";

const PublicNotes = (props) => {
  const { showSubpage } = props;
  const [publicNotesLoader, setPublicNotesLoader] = useState(false);
  const [savePublicNotesLoader, setSavePublicNotesLoader] = useState(false);
  const [subPagePublicNotes, setSubPagePublicNotes] = useState("");
  const [isEditNotes, setIsEditNotes] = useState(false);

  const getSubPageDiningConfigByID = async (id) => {
    const res = await getSubPageDiningConfigByIDApi(id);
    if (res && res.success) {
      setSubPagePublicNotes(res.data[0]?.notes);
    } else {
      setSubPagePublicNotes("");
    }
    setPublicNotesLoader(false);
  };

  useEffect(() => {
    if (showSubpage?.subPageId) {
      setPublicNotesLoader(true);
      getSubPageDiningConfigByID(showSubpage?.subPageId);
    }
  }, [showSubpage?.subPageId]);

  const handleSavePublicNotes = async (id) => {
    setSavePublicNotesLoader(true);
    const payLoadData = {
      notes: subPagePublicNotes,
    };
    const res = await editSubPageDiningConfigApi(payLoadData, id);
    if (res && res.success) {
      setSubPagePublicNotes(res?.data?.notes);
      setIsEditNotes(false);
    }
    setSavePublicNotesLoader(false);
  };

  return publicNotesLoader ? (
    <CakeSpinner className="my-5" />
  ) : (
    subPagePublicNotes && (
      <section className="mt-5">
        <h2 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
          Notes
        </h2>
        {isEditNotes ? (
          <div className="d-flex justify-content-between align-items-center">
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              value={subPagePublicNotes || ""}
              className="custom-input"
              style={{ width: "60rem" }}
              onChange={(e) => setSubPagePublicNotes(e.target.value)}
            />
            <div className="me-2 cursorPointer">
              <Button
                onClick={() => handleSavePublicNotes(showSubpage?.subPageId)}
                className="p-2"
              >
                <div className="d-flex gap-2 align-items-center">
                  <span className="ms-2">Save</span>
                  <span>
                    {savePublicNotesLoader && (
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <div className="d-flex justify-content-between">
            <div>{subPagePublicNotes}</div>

            <img
              onClick={() => setIsEditNotes(true)}
              className="cursorPointer"
              alt="edit"
              src={editIcon}
              width={30}
            />
          </div>
        )}
      </section>
    )
  );
};

export default PublicNotes;
