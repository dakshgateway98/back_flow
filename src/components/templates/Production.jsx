import _, { isArray, isEmpty } from "lodash";
import moment from "moment";
import React, {
  useCallback,
  // useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button, Form, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
//apis
import { editItemInfoApi, editMulItemInfoApi } from "../../api/iteminfo";
import { getAppSettingByIDApi } from "../../api/settings";
//helpers and static datas
import editIcon from "../../assets/icons/white-pencil.svg";
import { CheckedIcon, UserIcon } from "../../components/common/icons";
import { hexToRgbA, removeDuplicate } from "../../global/helpers";
import { updateBoardSizes } from "../../redux/actions/settingsAction";
import {
  modifierCatData,
  phasesId,
  tiersData,
  setting,
  modifierIdData,
} from "../../utils/StaticData";
//components
import NoData from "../common/NoData";
import SortButton from "../common/SortButton";
// import { SocketContext } from "../../context/socket";

const sortButtonsData = [
  { name: "SID", label: "S#" },
  { name: "order_time", label: "Time" },
];

const displayHeaderDateFormat = "dddd, MMMM D";

const modifiersArr = [
  { flavor: "/" },
  { filling: "///" },
  { iced_color: "//" },
  { iced: "/" },
  { borders: "" },
];

const getShape = (shape) => {
  switch (shape) {
    case "rnd":
      return "round";
    case "sht":
      return "sheet";
    case "sqr":
      return "square";
    default:
      return "";
  }
};

const getUpdatedId = (itemId, qtyItemIndex) => `${itemId}.${qtyItemIndex}`;

const Production = (props) => {
  const {
    ordersByDate,
    itemInfo,
    setItemInfo,
    productionFilters,
    setFilterDropdown,
    currentdropDownValue,
  } = props;

  // const socket = useContext(SocketContext);
  const [displayOrdersByDate, setDisplayOrdersByDate] = useState([]);
  const [edit, setEdit] = useState(null);
  const [currentNote, setCurrentNote] = useState({
    id: "",
    note_check: false,
    note: "",
  });
  const [activeSortingField, setActiveSortingField] = useState("order_time");
  const [sortOrder, setSortOrder] = useState(false);
  const [isToDisplayAllOrders, setIsToDisplayAllOrders] = useState(false);
  const [selectBoardSizes, setSelectBoardSizes] = useState([]);

  const { boardSizes } = useSelector((state) => state.settings);
  const { data: userData } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  // <------------------------------------------------------Helper Functions ------------------------------------------------------>

  const getInitialPhaseRequirements = (row, itemInfoData) => {
    const fixedModifiers = {
      [modifierCatData.filling]: false,
      [modifierCatData.iced_color]: false,
      [modifierCatData.iced]: false,
      [modifierCatData.borders]: false,
      [modifierCatData.board]: false,
      ...(itemInfoData?.notes !== null && { [modifierCatData.note]: false }),
    };
    if (row === 1) {
      return {
        [modifierCatData.flavor[0]]: false, // modiCat = 8
        ...fixedModifiers,
      };
    } else {
      return {
        [modifierCatData.flavor[1]]: false, // modiCat = 9
        ...fixedModifiers,
      };
    }
  };

  const getPhaseRequirements = (item, row, currModifiers, modifierInfo) => {
    const { modifierName, modifierCheck } = modifierInfo;
    let modifierId = modifierCatData[modifierName];
    if (modifierName === "flavor") {
      if (row === 1) {
        modifierId = modifierCatData[modifierName][0]; // modiCat = 8
      } else {
        modifierId = modifierCatData[modifierName][1]; // modiCat = 9
      }
    }
    return {
      ...(item ? item.phase_requirements : {}),
      [row]: {
        [phasesId.cakeAssembled]: {
          ...currModifiers,
          [modifierId]: modifierCheck,
        },
      },
    };
  };

  const checkPhase = (item, row, modiField) => {
    let check = false;
    if (
      item?.phase_requirements &&
      item?.phase_requirements.hasOwnProperty(row) &&
      item?.phase_requirements[row].hasOwnProperty(phasesId.cakeAssembled)
    ) {
      const cakeAssembledPhaseId =
        item?.phase_requirements[row][phasesId.cakeAssembled];

      if (cakeAssembledPhaseId && !isEmpty(cakeAssembledPhaseId)) {
        if (modiField === "flavor") {
          if (row === 1) {
            check = cakeAssembledPhaseId[modifierCatData.flavor[0]]; // modiCat = 8
          } else {
            check = cakeAssembledPhaseId[modifierCatData.flavor[1]]; // modiCat = 9
          }
        } else {
          check = cakeAssembledPhaseId[modifierCatData[modiField]];
        }
      }
    }
    return check;
  };

  const getItemColor = (requiredItem) => {
    let itemColor = "#ffffff";
    if (requiredItem && requiredItem?.user && requiredItem?.user?.color) {
      itemColor = requiredItem?.user?.color;
    }
    return itemColor;
  };

  const updateItemInfo = (itemId, updateKey, updateData, itemIdsArray) => {
    setItemInfo((prev) => {
      if (!isEmpty(itemIdsArray) && !itemId) {
        let updatedItemInfo = { ...prev };
        itemIdsArray.forEach((id) => {
          updatedItemInfo = {
            ...updatedItemInfo,
            [id]: {
              ...itemInfo[id],
              [updateKey]: updateData,
            },
          };
        });
        return {
          ...prev,
          ...updatedItemInfo,
        };
      } else {
        return {
          ...prev,
          [itemId]: {
            ...itemInfo[itemId],
            [updateKey]: updateData,
          },
        };
      }
    });
  };

  const handleEditItemInfo = async (payload, item, cakeItems, index) => {
    const itemId = getUpdatedId(item?.id, index);
    let res = await editItemInfoApi(payload, +itemId);
    if (!isEmpty(cakeItems)) {
      const otherItems = cakeItems
        .map((qtyCakeItems) =>
          qtyCakeItems.filter((cakeItem) => cakeItem?.id !== item?.id)
        )
        .filter((ele) => !isEmpty(ele));
      const isAllItemsCompleted = otherItems.every(
        (qtyCakeItems) =>
          itemInfo[getUpdatedId(qtyCakeItems[index]?.id, index)]?.item_phase >=
          phasesId.cakeAssembled
      );

      if (
        isAllItemsCompleted &&
        res.data.item_phase === phasesId.cakeAssembled
      ) {
        const itemIdsArray = _.flatten(
          cakeItems.map((qtyCakeItems) => {
            const requiredCakeItem = qtyCakeItems.find(
              (qty_ck_item) => qty_ck_item?.index === index
            );
            return getUpdatedId(requiredCakeItem?.itemObj?.id, index);
          })
        );
        const payload = {
          ids: itemIdsArray,
          user_id: null,
        };
        res = await editMulItemInfoApi(payload, itemIdsArray);
        setItemInfo((prev) => {
          return {
            ...prev,
            ...res.data,
          };
        });
      } else {
        setItemInfo((prev) => {
          return {
            ...prev,
            [itemId]: res.data,
          };
        });
      }
    } else {
      if (res.data.item_phase === phasesId.cakeAssembled) {
        const payload = {
          user_id: null,
        };
        res = await editItemInfoApi(payload, +itemId);
      }
      setItemInfo((prev) => {
        return {
          ...prev,
          [itemId]: res.data,
        };
      });
    }
  };

  const handleEditMulItemInfo = async (payload, itemIdsArray) => {
    const mulItemPayload = {
      ids: itemIdsArray,
      ...payload,
    };
    let res = await editMulItemInfoApi(mulItemPayload);

    if (res.data.item_phase === phasesId.cakeAssembled) {
      const payload = {
        user_id: null,
      };
      res = await editMulItemInfoApi(payload, itemIdsArray);
    }

    setItemInfo((prev) => {
      return {
        ...prev,
        ...res.data,
      };
    });
  };

  const getItemId = (item, qtyItemIndex) => {
    let itemId = getUpdatedId(item?.id, qtyItemIndex);
    if (item?.cake_items) {
      itemId = getUpdatedId(
        item?.cake_items[0][qtyItemIndex]?.id,
        qtyItemIndex
      );
    }
    return itemId;
  };

  const checkAllItemsBaked = useCallback(
    (item, index) => {
      if (item?.cake_items) {
        return item?.cake_items.every((qtyCakeItems) => {
          const requiredCakeItem = qtyCakeItems.find(
            (qty_ck_item) => qty_ck_item?.index === index
          );
          if (itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)]) {
            return (
              itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)]
                ?.item_phase >= phasesId?.baked
            );
          }
          return false;
        });
      } else {
        if (itemInfo[getUpdatedId(item?.id, index)]) {
          return (
            itemInfo[getUpdatedId(item?.id, index)]?.item_phase >=
            phasesId?.baked
          );
        }
        return false;
      }
    },
    [itemInfo]
  );

  // <----------------------------------------------------Board Sizes Functions ------------------------------------------------------>

  const getAppSettingByID = async () => {
    const res = await getAppSettingByIDApi(setting.board_sizes_ID);
    dispatch(updateBoardSizes({ ...res?.data?.settings }));
  };

  useEffect(() => {
    if (isEmpty(boardSizes)) {
      getAppSettingByID();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardSizes]);

  const getBoardSize = (item, cakeItem) => {
    const appInfo = item?.product?.app_info;
    let boardSizeValue = "";
    if (appInfo?.ck_tiers === 1 || !appInfo.ck_tiers) {
      boardSizeValue = appInfo?.ck_boardsize?.sizes
        ? Object.values(appInfo?.ck_boardsize?.sizes)[0]
        : appInfo?.ck_boardsize;
    } else {
      const requiredModifierItem = item?.modifieritems.find(
        (modiItem) => modiItem?.modifier?.modifierCat === modifierCatData.build
      );
      if (requiredModifierItem) {
        const cakeItemIndex = [...item?.cake_items]
          .sort((a, b) => {
            const a_cakeSize = a.product.app_info.ck_size;
            const b_cakeSize = b.product.app_info.ck_size;
            return +a_cakeSize > +b_cakeSize;
          })
          .findIndex((item) => item?.id === cakeItem?.id);

        const modifierId = requiredModifierItem?.modifier?.id;
        let requiredKey;
        requiredKey = Object.keys(appInfo).find(
          (key) => key === modifierId.toString()
        );
        if (!requiredKey) {
          requiredKey = Object.keys(appInfo).find((key) => {
            const keyStringArr = key.split("_");
            if (
              keyStringArr[keyStringArr.length - 1] === modifierId.toString()
            ) {
              return key;
            }
            return "";
          });
        }
        const requiredAppInfo = appInfo[requiredKey];
        if (isArray(requiredAppInfo)) {
          boardSizeValue = requiredAppInfo[cakeItemIndex];
        } else {
          const cakeSizes = Object.values(requiredAppInfo.sizes);
          boardSizeValue = cakeSizes[cakeItemIndex];
        }
      }
    }
    if (boardSizeValue) {
      const boardSizeId = Object.entries(boardSizes).find(
        ([id, value]) => value === boardSizeValue
      )[0];
      return {
        boardSizeValue,
        boardSizeId,
      };
    }
    return "";
  };

  const getBoardSizeValue = (id) => {
    const itemInfoObj = itemInfo[id];

    let boardId = false;
    if (itemInfoObj) {
      boardId = checkPhase(itemInfoObj, tiersData.tier_one, "board");
    }
    if (boardId) {
      return boardSizes[boardId];
    } else {
      const requiredLayoutObj = selectBoardSizes.find(
        (ele) => ele.item_id === id
      );
      if (!isEmpty(requiredLayoutObj)) {
        return requiredLayoutObj.board_size?.boardSizeValue;
      } else {
        return "";
      }
    }
  };

  const handleOnChangeBoardSize = (selectValue, item, cakeItems, index) => {
    const itemId = getUpdatedId(item.id, index);
    const itemInfoObj = itemInfo[itemId];
    const boardSizeId = Object.entries(boardSizes).find(
      ([id, value]) => value === selectValue
    )[0];
    let boardId = false;
    if (itemInfoObj) {
      boardId = checkPhase(itemInfoObj, tiersData.tier_one, "board");
    }
    if (boardId) {
      const modifierInfo = {
        modifierName: "board",
        modifierCheck: true,
      };
      handleOnBoardCheck(item, modifierInfo, cakeItems, index, boardSizeId);
    } else {
      if (selectValue) {
        const boardSize = {
          boardSizeValue: selectValue,
          boardSizeId,
        };

        setSelectBoardSizes((prev) =>
          prev.map((ele) => {
            if (ele.item_id === itemId) {
              return {
                ...ele,
                board_size: boardSize,
              };
            }
            return ele;
          })
        );
      }
    }
  };

  const updatePhaseRequirement = (
    item,
    updatedModifierInfo,
    cakeItems,
    index
  ) => {
    const itemId = getUpdatedId(item.id, index);
    const itemInfoObj = itemInfo[itemId];

    const appInfo = item?.product?.app_info;
    let rows = [1];
    if (appInfo?.ck_piece_cnt === 2 || appInfo?.ck_build === "dl") {
      rows.push(2);
    }
    let tempItemInfoObj = { ...itemInfoObj };

    rows.forEach((row) => {
      if (
        tempItemInfoObj?.phase_requirements &&
        !isEmpty(
          tempItemInfoObj?.phase_requirements &&
            tempItemInfoObj?.phase_requirements[row]
        )
      ) {
        const cakeAssembledPhaseId =
          tempItemInfoObj?.phase_requirements[row][phasesId.cakeAssembled];
        let tempPhaseRequirement = getPhaseRequirements(
          tempItemInfoObj,
          row,
          cakeAssembledPhaseId,
          updatedModifierInfo
        );
        const updatedPhaseRequirement = {
          ...tempItemInfoObj.phase_requirements,
          ...tempPhaseRequirement,
        };
        tempItemInfoObj = {
          ...tempItemInfoObj,
          phase_requirements: updatedPhaseRequirement,
        };
      } else {
        let tempPhaseRequirement = getPhaseRequirements(
          tempItemInfoObj,
          row,
          getInitialPhaseRequirements(row, tempItemInfoObj),
          updatedModifierInfo
        );
        const updatedPhaseRequirement = {
          ...tempItemInfoObj.phase_requirements,
          ...tempPhaseRequirement,
        };
        tempItemInfoObj = {
          ...tempItemInfoObj,
          phase_requirements: updatedPhaseRequirement,
        };
      }
    });

    updateItemInfo(
      itemId,
      "phase_requirements",
      tempItemInfoObj.phase_requirements
    );

    const payload = {
      phase_requirements: tempItemInfoObj.phase_requirements,
      user_id: itemInfoObj && itemInfoObj?.user ? itemInfoObj?.user?.id : null,
    };

    //calling itemInfo api
    handleEditItemInfo(payload, item, cakeItems, index);
  };

  const handleOnBoardCheck = async (
    item,
    modifierInfo,
    cakeItems,
    index,
    boardSizeId
  ) => {
    const itemId = getUpdatedId(item?.id, index);
    const updatedModifierInfo = {
      modifierName: modifierInfo.modifierName,
      modifierCheck: modifierInfo.modifierCheck
        ? boardSizeId ||
          selectBoardSizes.find((ele) => ele.item_id === itemId)?.board_size
            ?.boardSizeId
        : false,
    };
    updatePhaseRequirement(item, updatedModifierInfo, cakeItems, index);
  };

  const addFillingAndIcedValues = (
    modifiers,
    tempFillingValues,
    tempIcedValues
  ) => {
    if (modifiers?.modifierCat === modifierCatData?.filling) {
      tempFillingValues.push({
        name: modifiers?.kitchen_print_name,
        value: modifiers?.id,
      });
    } else if (modifiers?.modifierCat === modifierCatData?.iced) {
      tempIcedValues.push({
        name: modifiers?.kitchen_print_name,
        value: modifiers?.id,
      });
    }
  };

  useEffect(() => {
    if (!isEmpty(ordersByDate) && !isEmpty(boardSizes)) {
      let tempPhaseRequirement = [];
      let tempFillingValues = [];
      let tempIcedValues = [];

      const updateCategoryOrder = Object.entries(ordersByDate).map(
        ([orderDate, orderData]) => {
          let updatedOrders = [];
          if (orderData?.orders) {
            updatedOrders = Object.entries(orderData?.orders).map(
              ([orderId, orderDetail]) => {
                orderDetail?.items.forEach((item) => {
                  if (item?.cake_items) {
                    item?.cake_items.forEach((cakeItem) => {
                      for (let i = 1; i <= +cakeItem?.quantity; i++) {
                        tempPhaseRequirement.push({
                          item_id: getUpdatedId(cakeItem.id, i),
                          board_size: getBoardSize(item, cakeItem),
                        });
                      }

                      cakeItem?.modifieritems.forEach((modiItem) => {
                        const modifiers = modiItem?.modifier;
                        addFillingAndIcedValues(
                          modifiers,
                          tempFillingValues,
                          tempIcedValues
                        );
                      });
                    });
                  } else {
                    for (let i = 1; i <= +item?.quantity; i++) {
                      tempPhaseRequirement.push({
                        item_id: getUpdatedId(item?.id, i),
                        board_size: getBoardSize(item),
                      });
                    }
                    item?.modifieritems.forEach((modiItem) => {
                      const modifiers = modiItem?.modifier;
                      addFillingAndIcedValues(
                        modifiers,
                        tempFillingValues,
                        tempIcedValues
                      );
                    });
                    addFillingAndIcedValues();
                  }
                });
                return [orderId, orderDetail];
              }
            );
          }
          return [
            orderDate,
            { ...orderData, orders: Object.fromEntries(updatedOrders) },
          ];
        }
      );
      const removedEmptyOrders = updateCategoryOrder.filter(
        ([orderDate, orderData]) => !isEmpty(orderData)
      );
      setDisplayOrdersByDate(Object.fromEntries(removedEmptyOrders));
      setSelectBoardSizes(tempPhaseRequirement);

      setFilterDropdown([
        {
          filter: "fillings",
          filterValue: removeDuplicate(tempFillingValues, "value"),
        },
        {
          filter: "iced",
          filterValue: removeDuplicate(tempIcedValues, "value"),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersByDate, boardSizes]);

  // <----------------------------------------------------Modifiers Functions -------------------------------------------------------->

  const handleModifierDisabled = (itemInfoData) => {
    if (itemInfoData && itemInfoData?.item_phase >= phasesId.baked) {
      return false;
    }
    return true;
  };

  const handleModifiersOnChange = async (
    itemInfo,
    item,
    row,
    modifierInfo,
    cakeItems,
    index
  ) => {
    const itemId = getUpdatedId(item.id, index);
    let phaseRequirements = {};
    if (
      itemInfo[itemId] &&
      itemInfo[itemId]?.phase_requirements &&
      !isEmpty(
        itemInfo[itemId]?.phase_requirements &&
          itemInfo[itemId]?.phase_requirements[row]
      )
    ) {
      const cakeAssembledPhaseId =
        itemInfo[itemId]?.phase_requirements[row][phasesId.cakeAssembled];
      phaseRequirements = getPhaseRequirements(
        itemInfo[itemId],
        row,
        cakeAssembledPhaseId,
        modifierInfo
      );
    } else {
      phaseRequirements = getPhaseRequirements(
        itemInfo[itemId],
        row,
        getInitialPhaseRequirements(row, itemInfo[itemId]),
        modifierInfo
      );
    }

    updateItemInfo(itemId, "phase_requirements", phaseRequirements);

    const payload = {
      phase_requirements: phaseRequirements,
      user_id:
        itemInfo[itemId] && itemInfo[itemId]?.user
          ? itemInfo[itemId]?.user?.id
          : null,
    };

    handleEditItemInfo(payload, item, cakeItems, index);
  };

  const getModifiersValue = (modifiersItems, modifierValue) => {
    const modifierObj = modifiersItems.find(
      (modiItem) => modiItem?.modifier?.modifierCat === modifierValue
    );
    if (!isEmpty(modifierObj)) {
      return modifierObj?.modifier?.kitchen_print_name;
    }
    return "No modifier";
  };

  const renderLayout = (item, cakeItems, index) => {
    const appInfo = item?.product?.app_info;
    let rows = [1];
    if (appInfo?.ck_piece_cnt === 2 || appInfo?.ck_build === "dl") {
      rows.push(2);
    }
    return rows.map((row) => (
      <div
        className="d-flex gap-1 mb-4"
        style={{ height: "35px" }}
        key={`${row}.${index}`}
      >
        <div className={`cake-shape pt-1 ${getShape(appInfo?.ck_shape)}`}>
          {appInfo?.ck_size}
        </div>
        <div></div>
        <div>
          {modifiersArr.map((modifier) => {
            const modifierName = Object.keys(modifier)[0];
            return (
              <React.Fragment
                key={`${row}-${item.id}-${index + 1}-${modifierName}`}
              >
                <span className="modifiers" style={{ height: "35px" }}>
                  <input
                    disabled={handleModifierDisabled(
                      itemInfo[getUpdatedId(item?.id, index)]
                    )}
                    type="checkbox"
                    id={`${row}-${item.id}-${index + 1}-${modifierName}`}
                    className="visually-hidden modiInput"
                    checked={checkPhase(
                      itemInfo[getUpdatedId(item?.id, index)],
                      row,
                      modifierName
                    )}
                    onChange={(e) =>
                      handleModifiersOnChange(
                        itemInfo,
                        item,
                        row,
                        {
                          modifierName,
                          modifierCheck: e.target.checked,
                        },
                        cakeItems,
                        index
                      )
                    }
                  />
                  <label
                    className="mx-1"
                    htmlFor={`${row}-${item.id}-${index + 1}-${modifierName}`}
                    style={{ fontSize: "21px" }}
                  >
                    {modifierName === "flavor"
                      ? row === 2
                        ? getModifiersValue(
                            item?.modifieritems,
                            modifierCatData?.flavor[1]
                          )
                        : getModifiersValue(
                            item?.modifieritems,
                            modifierCatData?.flavor[0]
                          )
                      : getModifiersValue(
                          item?.modifieritems,
                          modifierCatData[modifierName]
                        )}
                  </label>
                </span>
                <span>{modifier[modifierName]}</span>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    ));
  };

  // <------------------------------------------------------Notes Functions ---------------------------------------------------------->

  const handleNoteAdd = (itemId) => {
    setEdit(itemId);
    setCurrentNote({ note_check: false, note: "" });
    updateItemInfo(itemId, "notes", "");
  };

  const handleNoteSave = (item, qtyItemIndex) => {
    const payload = {
      notes: currentNote.note.trim(),
    };

    setCurrentNote((prev) => {
      return {
        ...prev,
        note: currentNote.note.trim(),
      };
    });

    if (item?.cake_items) {
      const itemIdsArray = _.flatten(
        item?.cake_items.map((qtyCakeItems) => {
          const requiredCakeItem = qtyCakeItems.find(
            (qty_ck_item) => qty_ck_item?.index === qtyItemIndex
          );
          return getUpdatedId(requiredCakeItem?.itemObj.id, qtyItemIndex);
        })
      );
      // updating itemInfo stte
      updateItemInfo(null, "notes", currentNote.note.trim(), itemIdsArray);

      // calling itemInfo api
      handleEditMulItemInfo(payload, itemIdsArray);
    } else {
      // updating itemInfo stte
      updateItemInfo(
        getUpdatedId(item.id, qtyItemIndex),
        "notes",
        currentNote.note.trim()
      );

      // calling itemInfo api
      handleEditItemInfo(payload, item, item?.cake_items, qtyItemIndex);
    }
    setEdit(null);
  };

  const handleNoteDelete = (itemId) => {
    setEdit(null);
    setCurrentNote({ note_check: false, note: null, id: "" });

    updateItemInfo(
      itemId,
      "notes",
      (itemInfo[itemId] && itemInfo[itemId]?.notes) || null
    );
  };

  const handleNoteEdit = (itemId) => {
    setTimeout(function () {
      const input = document.getElementById(`notes-${itemId}`);
      const end = input.value.length;

      input.setSelectionRange(end, end);
      input.focus();
    }, 0);

    setCurrentNote({
      note: itemInfo[itemId]?.notes,
      note_check: checkPhase(itemInfo[itemId], tiersData.tier_one, "note"),
      id: itemId,
    });
    setEdit(itemId);
  };

  const handleNoteCheck = (item, modifierInfo, qtyItemIndex) => {
    setCurrentNote({
      ...currentNote,
      id: getItemId(item, qtyItemIndex),
      note_check: currentNote.modifierCheck,
    });

    if (item?.cake_items) {
      item?.cake_items.forEach((qtyCakeItems) =>
        updatePhaseRequirement(
          qtyCakeItems[qtyItemIndex],
          modifierInfo,
          item?.cake_items,
          qtyItemIndex
        )
      );
    } else {
      updatePhaseRequirement(item, modifierInfo, null, qtyItemIndex);
    }
  };

  const isNoteChecked = (itemId) => {
    return currentNote?.id === itemId
      ? currentNote.note_check
      : checkPhase(itemInfo[itemId], tiersData.tier_one, "note");
  };

  const renderNotes = (item, index) => {
    return (
      <>
        {(itemInfo[getItemId(item, index)] &&
          itemInfo[getItemId(item, index)]?.notes !== undefined &&
          itemInfo[getItemId(item, index)]?.notes !== null) ||
        isNoteChecked(getItemId(item, index)) ? (
          <>
            <td></td>
            <td>
              <div className="add-note-box">
                <Form.Group className="me-2 mt-2">
                  <Form.Check
                    label=""
                    onChange={(e) =>
                      handleNoteCheck(
                        item,
                        {
                          modifierName: "note",
                          modifierCheck: e.target.checked,
                        },
                        index
                      )
                    }
                    disabled={isEmpty(itemInfo[getItemId(item, index)]?.notes)}
                    checked={isNoteChecked(getItemId(item, index))}
                    type="checkbox"
                    id={`notes-check-${getItemId(item, index)}`}
                    className="custom-input-box checkbox-24 note"
                    name={"notes"}
                  />
                </Form.Group>
                <span className="text-white">Note //&nbsp;</span>
                <textarea
                  autoFocus
                  id={`notes-${getItemId(item, index)}`}
                  disabled={
                    edit && edit === getItemId(item, index) ? false : true
                  }
                  value={
                    edit && edit === getItemId(item, index)
                      ? currentNote?.note
                      : itemInfo[getItemId(item, index)]?.notes
                  }
                  onChange={(e) =>
                    setCurrentNote((prev) => {
                      return {
                        ...prev,
                        id: getItemId(item, index),
                        note: e.target.value,
                      };
                    })
                  }
                />
                {edit && edit === getItemId(item, index) ? (
                  <div className="d-flex flex-column gap-3 py-2">
                    <Button
                      className="save"
                      onClick={() => handleNoteSave(item, index)}
                      disabled={
                        !(
                          edit &&
                          edit === getItemId(item, index) &&
                          currentNote?.note
                        )
                      }
                    >
                      Save
                    </Button>
                    <Button
                      className="delete"
                      onClick={() => handleNoteDelete(getItemId(item, index))}
                    >
                      Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleNoteEdit(getItemId(item, index))}
                  >
                    <img
                      className="cursorPointer edit-icon"
                      alt="edit"
                      src={editIcon}
                      width={30}
                    />
                  </Button>
                )}
              </div>
            </td>
          </>
        ) : (
          <td className="px-5 pb-2">
            <Button
              className="add-note"
              onClick={() => handleNoteAdd(getItemId(item, index))}
            >
              Add Note
            </Button>
          </td>
        )}
      </>
    );
  };

  // <---------------------------------------------------User status Functions ------------------------------------------------------->

  const handleItemActive = async (item, isCompleted, index) => {
    let requiredItemInfo = itemInfo[getUpdatedId(item?.id, index)];
    if (item?.cake_items) {
      const requiredCakeItem = item?.cake_items[0].find(
        (qty_ck_item) => qty_ck_item?.index === index
      );
      requiredItemInfo =
        itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)];
    }
    let userId = isCompleted ? null : userData?.id;
    let updatedUser = {
      color: isCompleted ? null : userData?.color,
      id: userId,
      username: isCompleted ? null : userData?.username,
    };
    if (requiredItemInfo?.user?.id === userId) {
      const user = requiredItemInfo?.user;
      if (user?.color && user.id && user.username) {
        userId = null;
        updatedUser = {
          color: null,
          id: userId,
          username: null,
        };
      }
    }

    const payload = {
      user_id: userId,
    };

    if (item?.cake_items) {
      const itemIdsArray = _.flatten(
        item?.cake_items.map((qtyCakeItems) => {
          const requiredCakeItem = qtyCakeItems.find(
            (qty_ck_item) => qty_ck_item?.index === index
          );
          return getUpdatedId(requiredCakeItem?.itemObj?.id, index);
        })
      );

      updateItemInfo(null, "user", updatedUser, itemIdsArray);

      handleEditMulItemInfo(payload, itemIdsArray);
    } else {
      updateItemInfo(getUpdatedId(item?.id, index), "user", updatedUser);

      handleEditItemInfo(payload, item, item?.cake_items, index);
    }
  };

  const handleCurrentUserStatus = (
    item,
    itemInfo,
    currentUserStatus,
    index
  ) => {
    const phaseRequirements = itemInfo?.phase_requirements;
    const appInfo = item?.product?.app_info;

    if (phaseRequirements) {
      let rows = [1];
      if (appInfo?.ck_piece_cnt === 2 || appInfo?.ck_build === "dl") {
        rows.push(2);
      }
      const isAnyModifierCheck = rows.some((row) =>
        Object.entries(phaseRequirements).some(([tier, tierData]) =>
          Object.entries(tierData).some(([phaseId, modifierData]) =>
            Object.entries(modifierData).some(
              ([modifierId, modifierCheck]) => modifierCheck === true
            )
          )
        )
      );
      if (isAnyModifierCheck) {
        currentUserStatus = "in-progress";
      }

      if (
        itemInfo?.item_phase &&
        Object.keys(itemInfo?.current_phase).length === rows.length
      ) {
        return [
          currentUserStatus,
          itemInfo?.item_phase >= phasesId.cakeAssembled,
        ];
      } else return [currentUserStatus, false];
    } else return [currentUserStatus, false];
  };

  const getcurrentUserStatus = (item, index) => {
    let currentUserStatus = "default";
    let cakeItemModifiersChecks = [];
    let currentUserStatusArray = [];

    if (item?.cake_items) {
      item?.cake_items.forEach((qtyCakeItems) => {
        const requiredCakeItem = qtyCakeItems.find(
          (qty_ck_item) => qty_ck_item?.index === index
        );

        const [currentStatus, isCompleted] = handleCurrentUserStatus(
          requiredCakeItem?.itemObj,
          itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)],
          currentUserStatus
        );
        currentUserStatusArray.push(currentStatus);
        currentUserStatus = currentStatus;

        cakeItemModifiersChecks.push(isCompleted);
      });

      currentUserStatus = currentUserStatusArray.some(
        (status) => status === "in-progress"
      )
        ? "in-progress"
        : currentUserStatus;
    } else {
      const [currentStatus, isCompleted] = handleCurrentUserStatus(
        item,
        itemInfo[getUpdatedId(item?.id, index)],
        currentUserStatus,
        index
      );
      cakeItemModifiersChecks.push(isCompleted);
      currentUserStatus = currentStatus;
    }

    if (
      !isEmpty(cakeItemModifiersChecks) &&
      cakeItemModifiersChecks.every((check) => check)
    ) {
      currentUserStatus = "completed";
    }
    return currentUserStatus;
  };

  const isCurrentUser = (item, index) => {
    const requiredItem = itemInfo[getUpdatedId(item.id, index)];
    if (item?.cake_items) {
      const check = item.cake_items.some((qtyCakeItems) => {
        const requiredCakeItem = qtyCakeItems.find(
          (qty_ck_item) => qty_ck_item?.index === index
        );
        const requiredCakeItemInfo =
          itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)];
        return (
          requiredCakeItemInfo &&
          requiredCakeItemInfo?.user &&
          requiredCakeItemInfo?.user?.id &&
          requiredCakeItemInfo?.item_phase < phasesId.cakeAssembled
        );
      });
      return check;
    } else {
      return (
        requiredItem &&
        requiredItem?.user &&
        requiredItem?.user?.id &&
        requiredItem?.item_phase < phasesId.cakeAssembled
      );
    }
  };

  const getRequiredItem = (item, index) => {
    if (item?.cake_items) {
      const requiredCakeItem = item?.cake_items[0].find(
        (qty_ck_item) => qty_ck_item?.index === index
      );
      return itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)];
    } else return itemInfo[getUpdatedId(item.id, index)];
  };

  const renderIcon = (item, index) => {
    const currentUserStatus = getcurrentUserStatus(item, index);

    return (
      <Button
        className={`status-btn status-${
          isCurrentUser(item, index) ? "pink" : currentUserStatus
        }`}
        onClick={() =>
          handleItemActive(item, currentUserStatus === "completed", index)
        }
        disabled={currentUserStatus === "completed"}
      >
        {isCurrentUser(item, index) ? (
          <div className="d-flex align-items-center ">
            <div className="text-white">
              {getRequiredItem(item, index)?.user?.username}
            </div>
            <UserIcon color="white" />
          </div>
        ) : currentUserStatus === "completed" ? (
          <CheckedIcon color="white" />
        ) : (
          <UserIcon color="white" />
        )}
      </Button>
    );
  };

  const renderTitle = (appInfo, item, index) => (
    <>
      <td className="d-flex justify-content-center">
        <div
          className={`order-status ${
            checkAllItemsBaked(item, index) ? "baked" : "pending"
          }`}
        >
          {checkAllItemsBaked(item, index) ? "Baked" : "Pending"}
        </div>
      </td>
      <td>
        <div className="item-title">
          {!item?.cake_items && appInfo?.ck_size}{" "}
          {getShape(appInfo?.ck_shape).toUpperCase()} |{" "}
          {!item?.cake_items
            ? appInfo?.ck_build === "sl"
              ? "SINGLE LAYER"
              : "DOUBLE LAYER"
            : "STACKED"}
        </div>
        <hr className="divider" />
      </td>
    </>
  );

  const parentLayout = (item, cakeItem, index) => {
    return (
      <tr key={getUpdatedId(cakeItem?.id || item?.id, index)}>
        <td className="d-flex gap-2 ">
          <Form.Select
            style={{ width: "170px", height: "35px" }}
            value={getBoardSizeValue(
              getUpdatedId(cakeItem?.id || item?.id, index)
            )}
            className="custom-input board-select"
            onChange={(e) =>
              handleOnChangeBoardSize(
                e.target.value,
                cakeItem || item,
                item?.cake_items,
                index
              )
            }
          >
            {Object.entries(boardSizes).map(([boardSizeId, boardSizeName]) => (
              <option value={boardSizeName} key={boardSizeId}>
                {boardSizeName}
              </option>
            ))}
          </Form.Select>
          <Form.Group>
            <Form.Check
              onChange={(e) =>
                handleOnBoardCheck(
                  cakeItem || item,
                  {
                    modifierName: "board",
                    modifierCheck: e.target.checked,
                  },
                  item?.cake_items,
                  index
                )
              }
              label=""
              id={`board-${getUpdatedId(cakeItem?.id || item?.id, index)}`}
              checked={checkPhase(
                itemInfo[getUpdatedId(cakeItem?.id || item?.id, index)],
                tiersData.tier_one,
                "board"
              )}
              type="checkbox"
              className="custom-input-box checkbox-24 "
              name={"board-checkBox"}
            />
          </Form.Group>
        </td>
        <td>{renderLayout(cakeItem || item, item?.cake_items, index)}</td>
      </tr>
    );
  };

  // <-------------------------------------------------Render order and item Functions ----------------------------------------------->

  const getArray = (item) => {
    const quantityArr = item.cake_items[0]?.map((data) => data.index);
    return quantityArr;
  };
  const renderItem = (ck_item) => {
    if (ck_item?.cake_items) {
      const appInfo = ck_item?.product?.app_info;
      return getArray(ck_item).map((index) => {
        const requiredItem =
          itemInfo[
            getUpdatedId(ck_item?.cake_items[0][index]?.itemObj?.id, index)
          ];

        return (
          <table
            className="w-100 table-fixed item-table"
            key={getUpdatedId(ck_item?.id, index)}
            style={{
              backgroundColor: `${hexToRgbA(getItemColor(requiredItem))}`,
            }}
            cellPadding="10"
            cellSpacing="10"
          >
            <colgroup>
              <col width={250} />
              <col style={{ minWidth: "500px" }} />
              <col width={0} />
            </colgroup>
            <tbody className="border-0">
              <>
                <tr>
                  <td></td>
                  <td className="justify-content-end d-flex">
                    <div>{renderIcon(ck_item, index)}</div>
                  </td>
                </tr>
                <tr>{renderTitle(appInfo, ck_item, index)}</tr>
                {ck_item?.cake_items?.map((qtyCakeItems) => {
                  const requiredCakeItem = qtyCakeItems.find(
                    (qty_ck_item) => qty_ck_item?.index === index
                  )?.itemObj;
                  return parentLayout(ck_item, requiredCakeItem, index);
                })}
                <tr>{renderNotes(ck_item, index)}</tr>
              </>
            </tbody>
          </table>
        );
      });
    } else {
      const { itemObj: item, index: qtyItemIndex } = ck_item;
      const appInfo = item?.product?.app_info;

      const requiredItem = itemInfo[getUpdatedId(item.id, qtyItemIndex)];
      return (
        <table
          className="w-100 table-fixed item-table"
          key={getUpdatedId(item?.id, qtyItemIndex)}
          style={{
            backgroundColor: `${hexToRgbA(getItemColor(requiredItem))}`,
          }}
          cellPadding="10"
          cellSpacing="10"
        >
          <colgroup>
            <col width={250} />
            <col style={{ minWidth: "500px" }} />
            <col width={0} />
          </colgroup>
          <tbody className="border-0">
            <>
              <tr>
                <td></td>
                <td className="justify-content-end d-flex">
                  <div>{renderIcon(item, qtyItemIndex)}</div>
                </td>
              </tr>
              <tr>{renderTitle(appInfo, item, qtyItemIndex)}</tr>

              {parentLayout(item, null, qtyItemIndex)}

              <tr>{renderNotes(item, qtyItemIndex)}</tr>
            </>
          </tbody>
        </table>
      );
    }
  };

  const renderOrders = (ordersArray) => {
    return ordersArray
      .filter((order) => {
        return !isEmpty(_.flatten(order.items));
      })
      .map((order) => (
        <tr key={order?.id}>
          <td>
            <div className="mt-3 d-flex flex-column align-items-center">
              <div className="section">S1</div>
              <div>{moment(order?.pickup_time).format("hh:mm a")}</div>
              <div className="customer-name text-center">
                {order?.customer?.first_name + " " + order?.customer?.last_name}
              </div>
              <div>{order?.local_id}</div>
            </div>
          </td>
          <td className="px-0">
            <table className="w-100 table-fixed">
              <colgroup>
                <col style={{ minWidth: "900px" }} />
              </colgroup>
              <tbody className="border-0">
                <tr>
                  <td className="item-details">
                    {!isEmpty(order?.items) &&
                      order?.items.map((qtyItems) => {
                        return qtyItems.map((item) => {
                          return renderItem(item);
                        });
                      })}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      ));
  };

  const getAllOrders = useCallback((sortedOrders) => {
    const ordersArray = [];

    sortedOrders.forEach(([orderDate, orderData]) => {
      orderData.forEach((orderDetail) => {
        ordersArray.push(orderDetail);
      });
    });

    return ordersArray;
  }, []);

  // <----------------------------------------------------Sorting Functions ------------------------------------------------------------>

  const handleOnClickSort = (btnName) => {
    setActiveSortingField(btnName);
    setSortOrder((prev) => !prev);
    if (btnName === "order_time") {
      setIsToDisplayAllOrders(false);
    } else {
      setIsToDisplayAllOrders(true);
    }
  };

  const handleSort = useCallback((allOrders, sortField, sortOrder) => {
    if (sortField) {
      const sortedList = [...allOrders].sort((a, b) => {
        if (a[sortField] === undefined || null) return 1;
        if (b[sortField] === undefined || null) return -1;
        if (
          a[sortField] === undefined ||
          (null && b[sortField] === undefined) ||
          null
        ) {
          return 0;
        }
        if (sortField === "local_id") {
          let a_value = a[sortField];
          let b_value = b[sortField];

          a_value = a.local_id.replace(/^w/, "");
          b_value = b.local_id.replace(/^w/, "");

          return (+a_value - +b_value) * (sortOrder ? 1 : -1);
        }
        return -1;
      });
      return sortedList;
    }
  }, []);

  const getDataSortedByTime = useCallback((orderData, sortTimeOrder) => {
    const timeSorted = orderData.sort((a, b) => {
      const a_orderTimeMoment = moment(a?.pickup_time).valueOf();
      const b_orderTimeMoment = moment(b?.pickup_time).valueOf();

      const a_fullName = a.customer.first_name + a.customer.last_name;
      const b_fullName = b.customer.first_name + b.customer.last_name;
      if (a_orderTimeMoment !== b_orderTimeMoment)
        return (
          (a_orderTimeMoment - b_orderTimeMoment) * (sortTimeOrder ? 1 : -1)
        );
      else
        return (
          a_fullName
            .replace(/\s/g, "")
            .localeCompare(b_fullName.replace(/\s/g, "")) *
          (sortTimeOrder ? 1 : -1)
        );
    });
    return timeSorted;
  }, []);

  const handleTimeSort = useCallback(
    (orderData, sortOrder) => {
      if (orderData) {
        const sortedOrder = orderData.map(([dateSlot, orderDataArry]) => {
          const sortedTimeData = getDataSortedByTime(orderDataArry, sortOrder);
          return [dateSlot, sortedTimeData];
        });
        return sortedOrder;
      }
    },
    [getDataSortedByTime]
  );

  // <-----------------------------------------------------Filter Functions ---------------------------------------------------------->

  const handleBoardsFilter = useCallback(
    (key, item, index) => {
      switch (productionFilters[key]) {
        case 0:
          return true;
        case 1:
          return (
            itemInfo[getUpdatedId(item?.id, index)] &&
            checkPhase(
              itemInfo[getUpdatedId(item?.id, index)],
              tiersData.tier_one,
              "board"
            )
          );
        case 2:
          return !(
            itemInfo[getUpdatedId(item?.id, index)] &&
            checkPhase(
              itemInfo[getUpdatedId(item?.id, index)],
              tiersData.tier_one,
              "board"
            )
          );
        default:
          return true;
      }
    },
    [productionFilters, itemInfo]
  );

  const getBakedItemChecked = useCallback(
    (orderDetail) =>
      orderDetail.items.some((qtyItems) =>
        qtyItems.some((item, qtyItemIndex) =>
          checkAllItemsBaked(item, qtyItemIndex)
        )
      ),
    [checkAllItemsBaked]
  );

  const handleBakedFilter = useCallback(
    (key, item, index) => {
      switch (productionFilters[key]) {
        case 0:
          return true;
        case 1:
          return (
            itemInfo[getUpdatedId(item?.id, index)]?.item_phase >=
            phasesId?.baked
          );
        case 2:
          return !(
            itemInfo[getUpdatedId(item?.id, index)]?.item_phase >=
            phasesId?.baked
          );
        default:
          return true;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productionFilters, getBakedItemChecked]
  );

  const handleCompletedFilter = useCallback(
    (key, item, index) => {
      switch (productionFilters[key]) {
        case 0:
          return true;
        case 1:
          return getcurrentUserStatus(item, index) === "completed";
        case 2:
          return getcurrentUserStatus(item, index) === "default";
        case 3:
          return getcurrentUserStatus(item, index) === "in-progress";
        default:
          return true;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productionFilters]
  );

  const handleTierFilter = useCallback(
    (key, item, parentItem) => {
      const checkItem = { ...(parentItem || item) };
      switch (productionFilters[key]) {
        case 0:
          return true;
        case 1:
          return checkItem?.product?.app_info?.ck_tiers === 1;

        case 2:
          return checkItem?.product?.app_info?.ck_tiers === 2;

        case 3:
          return checkItem?.product?.app_info?.ck_tiers >= 3;

        default:
          return true;
      }
    },
    [productionFilters]
  );

  const handleShapeFilter = useCallback(
    (key, item) => {
      const ckShape = item?.product?.app_info?.ck_shape;
      switch (productionFilters[key]) {
        case 0:
          return true;
        case 1:
          return ckShape === "rnd";
        case 2:
          return ckShape === "sqr";
        case 3:
          return ckShape === "sht";
        default:
          return true;
      }
    },
    [productionFilters]
  );

  const getWhiteIcedColor = (item) =>
    item?.modifieritems.some(
      (modiItem) =>
        modiItem.modifier.modifierCat === modifierCatData?.iced_color &&
        modiItem?.modifier?.id === modifierIdData?.white_iced_color
    );
  const getVeganIcedColor = (item) =>
    item?.modifieritems.some(
      (modiItem) =>
        modiItem.modifier.modifierCat === modifierCatData?.iced_color &&
        modifierIdData?.vegan_iced.includes(modiItem?.modifier?.id)
    );

  const handleFlavorFilter = useCallback(
    (key, item) => {
      switch (productionFilters[key]) {
        case 0:
          return true;
        case 1:
          return getWhiteIcedColor(item);
        case 2:
          return !getWhiteIcedColor(item);
        case 3:
          return getVeganIcedColor(item);
        default:
          return true;
      }
    },
    [productionFilters]
  );

  const handleFillingsFilter = useCallback(
    (key, item) => {
      switch (productionFilters[key]) {
        case 0:
          return true;
        case 1:
          return item?.modifieritems.some(
            (modiItem) => +modiItem?.modifier?.id === +currentdropDownValue[key]
          );
        default:
          return true;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productionFilters, currentdropDownValue]
  );

  // <-----------------------------------------------------Use Memo Functions ---------------------------------------------------------->
  const getSimplifiedOrders = (ordersByObj) => {
    const result = Object.entries(ordersByObj).map(([orderDate, orderData]) => [
      orderDate,

      _.values(orderData.orders),
    ]);

    return result;
  };

  const getProductionFilteredItem = (item, index, parentItem) => {
    const filterKeys = Object.keys(productionFilters);
    const check = filterKeys.every((key) => {
      switch (key) {
        case "boards":
          return handleBoardsFilter(key, item, index);
        case "baked":
          return handleBakedFilter(key, item, index);
        case "completed":
          return handleCompletedFilter(key, item, index);
        case "tierCakes":
          return handleTierFilter(key, item, parentItem);
        case "shapeCakes":
          return handleShapeFilter(key, item);
        case "flavorCakes":
          return handleFlavorFilter(key, item);
        case "fillings":
        case "iced":
          return handleFillingsFilter(key, item);
        default:
          return true;
      }
    });
    return check;
  };

  const handleIsEmptyOrdersForFilter = (orders) => {
    return orders.filter(([orderId, order]) => {
      return !(isEmpty(order?.items) || isEmpty(_.flatten(order?.items)));
    });
  };

  const updateOrderAccordingToQuantity = (ordersByObj) => {
    const result = Object.entries(ordersByObj).map(([orderDate, orderData]) => {
      if (orderData?.orders) {
        const updatedOrders = Object.entries(orderData?.orders).map(
          ([orderId, order]) => {
            const updatedItems = order?.items.map((item) => {
              const tempItem = [];
              if (item?.cake_items) {
                const updatedCakeItems = item?.cake_items
                  .map((cakeItem, cakeItemIndex) => {
                    const tempCakeItem = [];

                    for (let i = 1; i <= +cakeItem?.quantity; i++) {
                      const isFilter = getProductionFilteredItem(
                        cakeItem,
                        i,
                        item
                      );
                      if (isFilter) {
                        tempCakeItem.push({ itemObj: cakeItem, index: i });
                      }
                    }
                    return tempCakeItem;
                  })
                  .filter((cakeItem) => !isEmpty(cakeItem));
                if (!isEmpty(updatedCakeItems)) {
                  return [
                    {
                      ...item,
                      cake_items: updatedCakeItems,
                    },
                  ];
                } else {
                  return [];
                }
              } else {
                for (let i = 1; i <= +item?.quantity; i++) {
                  if (getProductionFilteredItem(item, i)) {
                    tempItem.push({ itemObj: item, index: i });
                  }
                }
                return tempItem;
              }
            });
            return [
              orderId,
              {
                ...order,
                items: updatedItems,
              },
            ];
          }
        );
        return [
          orderDate,
          {
            ...orderData,
            orders: Object.fromEntries(
              handleIsEmptyOrdersForFilter(updatedOrders)
            ),
          },
        ];
      }
      return [orderDate, { ...orderData }];
    });
    return Object.fromEntries(result);
  };

  const checkBoxFilterOrders = useMemo(
    () => {
      const updatedOrdersByDate =
        updateOrderAccordingToQuantity(displayOrdersByDate);
      return getSimplifiedOrders(updatedOrdersByDate);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productionFilters, displayOrdersByDate, currentdropDownValue, itemInfo]
  );

  const sortedAllOrders = useMemo(() => {
    const allOrders = getAllOrders(checkBoxFilterOrders);
    if (activeSortingField === "order_time") {
      return handleTimeSort(checkBoxFilterOrders, sortOrder);
    } else {
      return handleSort(allOrders, activeSortingField, sortOrder);
    }
  }, [
    activeSortingField,
    sortOrder,
    checkBoxFilterOrders,
    getAllOrders,
    handleTimeSort,
    handleSort,
  ]);

  const handleIsEmptyOrders = (selectedOrdersView) => {
    if (isToDisplayAllOrders) {
      return !isEmpty(selectedOrdersView);
    } else {
      return selectedOrdersView.some(
        ([dateSlot, orderData]) => !isEmpty(orderData)
      );
    }
  };

  return (
    <Table
      responsive
      className="editable-table custom-table-striped production"
    >
      <colgroup>
        <col width={150} />
        <col width={800} />
        <col width={0} />
      </colgroup>
      <thead className="border-0 ">
        <tr>
          <th className="d-flex">
            {sortButtonsData.map((data, index) => (
              <React.Fragment key={data.name}>
                <SortButton
                  activeSortingField={activeSortingField}
                  btnName={data.name}
                  onClickSort={handleOnClickSort}
                  btnLabel={data.label}
                />
              </React.Fragment>
            ))}
          </th>
          <th>
            <table className="w-100 table-fixed">
              <colgroup>
                <col width={265} />
                <col style={{ minWidth: "450px" }} />
                <col width={0} />
              </colgroup>
              <thead>
                <tr>
                  <th>Boards</th>
                  <th>
                    Size/Shape | Flavor / Filling(s) /// Iced Color // Iced /
                    Borders
                  </th>
                  <th></th>
                </tr>
              </thead>
            </table>
          </th>
        </tr>
      </thead>
      <tbody>
        {!isEmpty(sortedAllOrders) && handleIsEmptyOrders(sortedAllOrders) ? (
          !isToDisplayAllOrders ? (
            sortedAllOrders.map(
              ([dateSlot, orderData]) =>
                !isEmpty(orderData) && (
                  <React.Fragment key={dateSlot}>
                    <tr className="slot-header">
                      <th colSpan={2} className="ps-4">
                        {moment(dateSlot).format(displayHeaderDateFormat)}
                      </th>
                    </tr>
                    {renderOrders(orderData)}
                  </React.Fragment>
                )
            )
          ) : (
            renderOrders(sortedAllOrders)
          )
        ) : (
          <tr className="bg-white">
            <td colSpan={4}>
              <NoData />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default Production;
