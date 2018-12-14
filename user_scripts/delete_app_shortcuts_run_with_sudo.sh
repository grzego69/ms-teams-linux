#!/bin/bash

rm /usr/share/applications/appimagekit-ms-teams*.desktop &> /dev/null
rm /usr/local/share/applications/appimagekit-ms-teams*.desktop &> /dev/null
rm ~/.local/share/applications/appimagekit-ms-teams*.desktop &> /dev/null

echo "If you had the \"MS Teams\" application shortcuts, they were deleted."
