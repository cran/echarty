% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/util.R
\name{ec.inspect}
\alias{ec.inspect}
\title{Chart to JSON}
\usage{
ec.inspect(wt, target = "opts", ...)
}
\arguments{
\item{wt}{An \code{echarty} widget as returned by \link{ec.init}}

\item{target}{type of resulting value: \cr
\verb{   }'opts' - the htmlwidget \emph{options} as JSON (default)\cr
\verb{   }'full' - the \emph{entire} htmlwidget as JSON\cr
\verb{   }'data' - info about chart's embedded data (char vector)}

\item{...}{Additional attributes to pass to \link[jsonlite]{toJSON}\cr
'file' - optional file name to save to when target='full'\cr}
}
\value{
A JSON string, except when \code{target} is 'data' - then
a character vector.
}
\description{
Convert chart to JSON string
}
\details{
Must be invoked or chained as last command.\cr
target='full' will export all JavaScript custom code, ready to be used on import.\cr
See also \link{ec.fromJson}.
}
\examples{
# extract JSON
json <- cars |> ec.init() |> ec.inspect()
json

# get from JSON and modify plot
ec.fromJson(json) |> ec.theme('macarons')

}
