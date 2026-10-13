const block=`# BEGIN SERAGAM PUBLIC
Options -Indexes
DirectoryIndex index.html
Require all granted
<FilesMatch "^\\.">
    Require all denied
</FilesMatch>
# END SERAGAM PUBLIC`;

export function publicHtaccess(existing=''){
 // Keep Passenger directives maintained by cPanel across staged builds.
 const rest=existing.replace(/# BEGIN SERAGAM PUBLIC\r?\n[\s\S]*?# END SERAGAM PUBLIC\r?\n?/g,'').trim();
 return block+'\n'+(rest?rest+'\n':'');
}
