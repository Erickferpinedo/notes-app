import moment from "moment";
import React from "react";
import { GoArchive } from "react-icons/go";
import { MdCreate, MdDelete } from "react-icons/md";

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isArchived,
  onEdit,
  onDelete,
  onArchiveNote,
}) => {
  return (
    <div className="border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out">
      <div className="flex items-center justify-between">
        <div>
          <h6 className="text-sm font-medium">{title}</h6>
          <span className="text-xs text-slate-500">
            {date ? moment(date).format("Do MMM YYYY") : "-"}
          </span>
        </div>

        <GoArchive
          className={`icon-btn text-xl text-slate-300 cursor-pointer hover:text-blue-600 ${
            isArchived ? "text-primary" : "text-slate-300"
          }`}
          onClick={onArchiveNote}
        />
      </div>

      <p className="text-xs text-slate-600 mt-2">{content?.slice(0, 60)}</p>

      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-slate-500">
          {tags.map((item) => `#${item} `)}
        </div>

        <div className="flex items-center gap-2">
          <MdCreate
            className="icon-btn text-xl text-slate-300 cursor-pointer hover:text-primary hover:text-green-600"
            onClick={onEdit}
          />
          <MdDelete
            className="icon-btn text-xl text-slate-300 cursor-pointer hover:text-primary hover:text-red-500"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
