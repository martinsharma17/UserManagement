import { UserCircleIcon } from "@heroicons/react/24/solid";

const ProfileIcon = ({ name }) => (
  <div className="flex items-center gap-2">
    <UserCircleIcon className="h-8 w-8 text-brand" />
    <span className="text-sm text-gray-800">{name}</span>
  </div>
);

export default ProfileIcon;

