# Logger plug-in

The logger plug-in establishes a base set of message logging behaviors. This plug-in (like all other plug-ins)
can be overridden or extended by another logging plug-in if desired. It simply delegates to the `console` object
for all logging needs when a log event is handled (which can be triggered by any module). It does not affect or fire any events.
In this sense, it is a passive module. The `console` method called depends on the type of message.
For example, an error message is logged using `console.error` (if available, otherwise `console.log` with an '[ERROR]' prefix on the message text).
Another logging plug-in that extends or replaces this one may, for example, send all error log messages to some server
for further processing by observing the same event.

Initial docs are at
http://fineuploader.github.io/modern-uploader/docs/packages/logger/.
