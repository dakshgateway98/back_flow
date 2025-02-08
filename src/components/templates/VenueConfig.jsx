import _, { isEmpty } from "lodash";
import React, { useMemo, useState } from "react";
import { Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../../api";
import {
  getVenueRoomsApi,
  addVenueRoomsApi,
  editVenueRoomsApi,
  deleteVenueRoomsApi,
} from "../../api/venue";
import editIcon from "../../assets/icons/pencil.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import resetIcon from "../../assets/icons/reset.svg";
import subDirectorySVG from "../../assets/icons/sub-directory.svg";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import { updateVenueRooms } from "../../redux/actions/venueConfigActions";

const initialState = {
  edit_id: "",
  venue_room: "",
  capacity: null,
  city: "",
  venue_id: null,
};

const VenueConfig = (props) => {
  const { token } = useSelector((state) => state.user);
  const { allVenueRooms } = useSelector((state) => state.venueConfig);

  const [editState, setEditState] = useState(initialState);
  const [submitButtonLoader, setSubmitButtonLoader] = useState(false);
  const [selectedID, setSelectedID] = useState("");

  const dispatch = useDispatch();

  const getAllVenueRooms = async () => {
    setToken(token);
    const res = await getVenueRoomsApi();
    if (res && res.success === true) {
      dispatch(updateVenueRooms(res.data));
    }
  };

  const handleEdit = (venueRoomDetails) => {
    setEditState({
      edit_id: venueRoomDetails?.id,
      venue_room: venueRoomDetails?.name,
      capacity: +venueRoomDetails?.capacity,
      city: venueRoomDetails?.city,
      venue_id: +venueRoomDetails?.venue_id || "",
    });
  };

  const handleCancel = () => {
    setEditState(initialState);
  };

  const handleOnChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setEditState((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleValidation = (venue_room) => {
    if (!venue_room) {
      displayErrorToast("Please fill Venue/Room Name field", 3000);
      return false;
    }

    return true;
  };

  const handleDisabledPageList = () => {
    if (editState.edit_id) {
      if (allVenueRooms[editState?.edit_id]?.rooms) {
        return true;
      }
    }
    return false;
  };

  const handleSubmit = async () => {
    setSubmitButtonLoader(true);

    const { edit_id, venue_room, capacity, city, venue_id } = editState;
    if (edit_id) {
      if (handleValidation(venue_room)) {
        const payLoadData = {
          name: venue_room,
          capacity: venue_id ? +capacity : null,
          ...(!venue_id && { city }),
          ...(venue_id && { venue_id: +venue_id }),
        };

        const res = await editVenueRoomsApi(payLoadData, edit_id);
        if (res?.success === true) {
          getAllVenueRooms();
          setEditState(initialState);
          displaySuccessToast(res.message);
        }
      }
    } else {
      if (handleValidation(venue_room)) {
        const payLoadData = {
          name: venue_room,
          capacity: venue_id ? +capacity : null,
          ...(!venue_id && { city }),
          ...(venue_id && { venue_id: +venue_id }),
        };

        const res = await addVenueRoomsApi(payLoadData);
        if (res?.success === true) {
          getAllVenueRooms();
          setEditState(initialState);
          displaySuccessToast(res.message);
        }
      }
    }
    setSubmitButtonLoader(false);
  };

  const handleCloseConfirmbox = () => setSelectedID("");

  const handleDelete = async () => {
    const res = await deleteVenueRoomsApi(selectedID);
    if (res?.success === true) {
      getAllVenueRooms();
    }
    handleCloseConfirmbox();
  };

  const sortedVenueRooms = useMemo(() => {
    const sortedVenues = Object.entries(_.cloneDeep(allVenueRooms)).sort(
      (a, b) => {
        const a_venueRooms = a[1];
        const b_venueRooms = b[1];
        return a_venueRooms.name
          .replace(/\s/g, "")
          .localeCompare(b_venueRooms.name.replace(/\s/g, ""));
      }
    );
    return sortedVenues.map(([venueId, venueDetails]) => {
      let sortedRoom;
      if (venueDetails?.rooms) {
        sortedRoom = Object.entries(venueDetails?.rooms).sort((a, b) => {
          const a_room = a[1];
          const b_room = b[1];
          return a_room.name
            .replace(/\s/g, "")
            .localeCompare(b_room.name.replace(/\s/g, ""));
        });
      }
      return [
        venueId,
        {
          ...venueDetails,
          ...(sortedRoom && {
            rooms: sortedRoom,
          }),
        },
      ];
    });
  }, [allVenueRooms]);

  return (
    <>
      <Table responsive className="editable-table">
        <colgroup style={{ minWidth: "450px" }}>
          <col width={90} />
          <col width={90} />
          <col width={90} />
          <col width={90} />
          <col width={90} />
        </colgroup>
        <thead className="border-0">
          <tr>
            <th>Venue/Room</th>
            <th>Max Capacity</th>
            <th>City</th>
            <th>Room of</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {!isEmpty(sortedVenueRooms) &&
            sortedVenueRooms.map(([venueId, venueDetails]) => (
              <React.Fragment key={venueId}>
                <tr>
                  <td className="align-middle">{venueDetails?.name}</td>
                  <td></td>
                  <td className="align-middle">{venueDetails?.city}</td>
                  <td className="align-middle">-</td>
                  <td>
                    {" "}
                    <img
                      className="cursorPointer"
                      alt="edit"
                      src={editIcon}
                      width={30}
                      onClick={() => handleEdit(venueDetails)}
                    />
                    <img
                      className="cursorPointer edit-icon"
                      alt="edit"
                      src={deleteIcon}
                      width={20}
                      onClick={() => setSelectedID(venueId.toString())}
                    />
                  </td>
                </tr>
                {!isEmpty(venueDetails?.rooms) &&
                  venueDetails?.rooms.map(([roomID, roomDetails]) => (
                    <tr key={roomID}>
                      <td className="d-flex align-items-center align-middle">
                        <img
                          src={subDirectorySVG}
                          className="p-1"
                          height="30"
                          width="30"
                          alt=""
                        />
                        {roomDetails?.name}
                      </td>
                      <td>{roomDetails?.capacity}</td>

                      <td className="align-middle"> </td>
                      <td className="align-middle">{venueDetails?.name}</td>

                      <td>
                        {" "}
                        <img
                          className="cursorPointer"
                          alt="edit"
                          src={editIcon}
                          width={30}
                          onClick={() => handleEdit(roomDetails)}
                        />
                        <img
                          className="cursorPointer edit-icon"
                          alt="edit"
                          src={deleteIcon}
                          width={20}
                          onClick={() => setSelectedID(roomID.toString())}
                        />
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}

          <tr>
            <td colSpan="5" className="p-0 border-dark"></td>
          </tr>
          <React.Fragment>
            <tr>
              <th>Venue/Room</th>
              <th>Max Capacity</th>
              <th>City</th>
              <th>Room of</th>
              <th></th>
            </tr>

            <tr>
              <td>
                <Form.Control
                  type="text"
                  className="custom-input"
                  value={editState.venue_room || ""}
                  name="venue_room"
                  onChange={(e) => handleOnChange(e)}
                />
              </td>
              <td>
                {" "}
                <Form.Control
                  type="text"
                  className="custom-input"
                  value={editState.capacity || ""}
                  name="capacity"
                  onChange={(e) => handleOnChange(e)}
                />
              </td>
              <td>
                {" "}
                <Form.Control
                  type="text"
                  className="custom-input"
                  value={editState.city || ""}
                  name="city"
                  onChange={(e) => handleOnChange(e)}
                />
              </td>
              <td>
                <Form.Select
                  className="custom-input"
                  value={editState.venue_id || ""}
                  name="venue_id"
                  onChange={(e) => handleOnChange(e)}
                  disabled={handleDisabledPageList()}
                >
                  <option value="" hidden>
                    Please Select
                  </option>
                  <option value="">none</option>
                  {!isEmpty(sortedVenueRooms) &&
                    sortedVenueRooms.map(([venueId, venue]) => (
                      <option value={venueId} key={venueId}>
                        {venue?.name}
                      </option>
                    ))}
                </Form.Select>
              </td>
              <td>
                <div className="d-flex">
                  <div className="me-2 cursorPointer">
                    <Button className="p-2" onClick={() => handleSubmit()}>
                      <div className="d-flex gap-2 align-items-center">
                        <span> {editState.edit_id ? "Update" : "Add"}</span>
                        {submitButtonLoader && (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </Button>
                  </div>
                  <span
                    className="cursorPointer"
                    onClick={() => handleCancel()}
                  >
                    <img src={resetIcon} width={30} alt="reset" />
                  </span>
                </div>
              </td>
            </tr>
          </React.Fragment>
        </tbody>
      </Table>

      <Modal show={!isEmpty(selectedID)} onHide={handleCloseConfirmbox}>
        <Modal.Header closeButton>
          <Modal.Title>Delete setting</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this setting?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmbox}>
            Close
          </Button>
          <Button variant="primary" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default VenueConfig;
