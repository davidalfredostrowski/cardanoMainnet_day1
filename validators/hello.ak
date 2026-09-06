use aiken/collection/list
use cardano/script_context.{ScriptContext}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}

pub type Datum {
  message: ByteArray,
}

pub type Redeemer {
  new_message: ByteArray,
}

validator hello {
  spend(
    datum_opt: Option<Datum>,
    redeemer: Redeemer,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(_old_datum) = datum_opt

    expect Some(own_input) =
      list.find(
        self.inputs,
        fn(input) {
          input.output_reference == own_ref
        },
      )

    list.any(
      self.outputs,
      fn(output) {
        if output.address == own_input.output.address {
          when output.datum is {
            InlineDatum(output_datum) ->
              if output_datum is Datum {
                output_datum.message == redeemer.new_message
              } else {
                False
              }

            _ -> False
          }
        } else {
          False
        }
      },
    )
  }

  else(_ctx: ScriptContext) {
    False
  }
}
